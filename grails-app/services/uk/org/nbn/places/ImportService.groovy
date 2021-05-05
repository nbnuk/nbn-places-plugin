package uk.org.nbn.places

import uk.org.nbn.places.webapp2.SearchRequestParamsDTO
import grails.converters.JSON
import org.grails.web.json.JSONObject

class ImportService {

    def grailsApplication
    def biocacheService
    def bieService
   

   def importSpeciesCountCache(id){
        JobReport.withNewSession {
            log.info "importSpeciesCountCache jobReport:"+id
         
            def jobReport  = new SpeciesCountImportJobReport(inner: JobReport.findById(id))
            
            jobReport.inner.jobStatus = JobStatus.RUNNING
            jobReport.inner.save(flush:true)
           
            try{

                importPlaces(jobReport)

                importSpeciesCount(jobReport)
            
            }
            catch(Exception e){
                _fatalError(jobReport, e)
            }
            
            jobReport.inner.finished()
            jobReport.inner.save(flush:true); 
        }   
    }

    def retryFailedImportSpeciesCountCache(jobId){
        JobReport.withNewSession {

            def jobReport  = new SpeciesCountImportJobReport(inner: JobReport.findById(id))           
            jobReport.inner.startRunningRetry()
            jobReport.inner.save(flush:true)
            try{
                def places = Place.findAllByFailedImport(1)
            
                places.each { place ->           
                    importSpeciesCountForPlace(place, jobReport)              
                }   
            }
            catch(Exception e){
                _fatalError(jobReport, e)
            }
            jobReport.inner.finished()
            jobReport.inner.save(flush:true);        
        }        
    }
    
    private def importPlaces(jobReport){
        
        _info jobReport, "Importing places"
           
        def resp;
        def startIndex = 0
        def rows = grailsApplication.config?.speciesCountImport?.defaultBatchSize ?: 50
        def nPlaces;
            
        while (true) {
            def requestObj = new SearchRequestParamsDTO("", [], startIndex, rows, "", "desc")
            
            def searchResultsArr = bieService.searchBie(requestObj)
            if (!nPlaces){
                nPlaces = searchResultsArr[0]?.searchResults?.totalRecords?:0;
                //nPlaces=20; //TODO
            }

            searchResultsArr[0].searchResults.results.each { rs ->           
                    
                _dump "Place", rs

                def place = new Place(name:rs.name);
                place.id=rs.guid              
                place.save();
            }

            jobReport.increasePlaceCount searchResultsArr[0].searchResults.results.size()            
            jobReport.inner.save(flush:true);
            
            startIndex += rows

            if ( startIndex >= nPlaces) break;
        
        }  
       
    }


    private def importSpeciesCount(jobReport){
        
        _info jobReport, "Importing species counts"
        
        def resp;
        def foffset = 0
        def flimit = grailsApplication.config?.speciesCountImport?.defaultBatchSize ?: 50
        def failedImportThreshold = grailsApplication.config?.speciesCountImport?.failedImportThreshold ?: 1000000
        def abandonImport=false
        def processedAllPlaces=false;
        
        while (true) {
            def polygons = biocacheService.getPolygonsWhichHaveSpeciesCounts(flimit, foffset)
              
            polygons.facetResults[0].fieldResult.each { rs ->           
                if (!rs.label.equals("Not supplied")) {
                    
                    _dump "Polygon", rs

                    def place = Place.findByName(rs.label);

                    _dump "Place", place

                    importSpeciesCountForPlace(place, jobReport) 

                    jobReport.increaseProcessedPlaceCount 1
                } 
                else if (polygons.facetResults[0].fieldResult.size()<2) {
                    processedAllPlaces = true;
                }                               
            }
            
            jobReport.inner.save(flush:true);
            

            if (jobReport.getFailedImportCount() > failedImportThreshold) {
                abandonImport = true
                _fatalError(jobReport, "IMPORT ABANDONED. TOO MANY IMPORT FAILURES.")  
            }  
        
            if ( processedAllPlaces || abandonImport) break;

            foffset += flimit
           
        }
    }


    private def importSpeciesCountForPlace(place, jobReport){
        def speciesCounts = biocacheService.getSpeciesCounts(["cl257:\"${place.name}\"", "-occurrence_status:absent"])
              
        _dump "speciesCounts", speciesCounts
               
        if (speciesCounts instanceof JSONObject && speciesCounts.has("error")){
            failedImport place, jobReport, speciesCounts.error
        }
        else{
         
            def speciesCountsOfSpecialInterest = biocacheService.getSpeciesCounts(["cl257:\"${place.name}\"", "-occurrence_status:absent", "species_list_uid:dr2492"])
                    
            _dump "speciesCountsOfSpecialInterest", speciesCountsOfSpecialInterest
                  
            if (speciesCountsOfSpecialInterest instanceof JSONObject && speciesCountsOfSpecialInterest.has("error")){
                failedImport place, jobReport, speciesCountsOfSpecialInterest.error 
            }
            else{
                def lst = createCachedSpeciesCountList(place, speciesCounts,speciesCountsOfSpecialInterest);
                _dump "merged speciesCountslist", lst
                        
                jobReport.increaseSpeciesCountTotal lst.size()                       
                jobReport.inner.save(flush:true);  
                                          
            }   
                       
        }
    }

    private def createCachedSpeciesCountList(place, speciesCounts, speciesCountsOfSpecialInterest){
        def map = [:]

        speciesCounts.each{
            map.put(it.name, 
            new CachedSpeciesCount(speciesCount:it.speciesCount, selectedSpeciesCount:0, category:it.name))
        }

        speciesCountsOfSpecialInterest.each{ 
            def cachedSpeciesCount = map.get(it.name)
            if (!cachedSpeciesCount){
                map.put(it.name, 
                new CachedSpeciesCount(speciesCount:0, selectedSpeciesCount:it.speciesCount, category:it.name))
            }
            else
                cachedSpeciesCount.selectedSpeciesCount=it.speciesCount 
        }

        map.each{
            it.value.place=place
            it.value.save()
        }
        map.values()
    }

    class ImportJob implements Runnable {
         public void run() {
            importSpeciesCountCache();
         }
    }

    private failedImport(place, jobReport, message){       
        place.failedImport=1
        place.importErrorMessage=message
        place.save(flush:true)

        def info = "AN IMPORT FAILED: "+message;
        jobReport.inner.info = info.length()>250?info.substring(0,250):info 
        jobReport.inner.hasError=1
        jobReport.increaseFailedImportCount 1
        jobReport.inner.save(flush:true)

        log.info message
    }

    private _fatalError(JobReport jobReport, Exception exception){
        log.error(exception.getMessage(), exception)
        def info = "IMPORT FATAL ERROR. "+exception.getMessage();
       
        jobReport.inner.info= info.length()>250?info.substring(0,250):info 
        jobReport.inner.hasError=1
        jobReport.inner.save(flush:true)
        
    }

     private _fatalError(JobReport jobReport, String message){
        log.error(message)
        def info = "IMPORT FATAL ERROR. "+message;
        
        jobReport.inner.info= info.length()>250?info.substring(0,250):info 
        jobReport.inner.hasError=1
        jobReport.inner.save(flush:true)
        
    }

    private _info(jobReport, message){
        jobReport.inner.info = message
        jobReport.inner.save(flush:true)

        log.info message
    }

    private _dump(title, obj){
        return;
        println "..............................DUMP ${title}...................."
        println obj
        println "..............................DUMP END...................."
    }


    class SpeciesCountImportJobReport {
    
        JobReport inner;

        void increasePlaceCount(amount){
            inner.increaseCount3 amount
        }

        void increaseProcessedPlaceCount(amount){
            inner.increaseCount0 amount
        }

        void increaseSpeciesCountTotal(amount){
            inner.increaseCount1 amount
        }

        void increaseFailedImportCount(amount){
            inner.increaseCount2 amount
        }

        def getFailedImportCount() {return inner.count2}
    } 
 
}

