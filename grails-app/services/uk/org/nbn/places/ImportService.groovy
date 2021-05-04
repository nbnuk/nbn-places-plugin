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
            log.info "......................................importSpeciesCountCache jobReport:"+id
         
            def jobReport = JobReport.findById(id);
            jobReport.jobStatus = JobStatus.RUNNING
            jobReport.save(flush:true)
            log.info "......................................"

            // def jobReport = new JobReport(description:"Import species count cache")
            // jobReport.startRunning()
            // jobReport.save(flush:true)

            try{
            
            def resp;
            def startIndex = 0
            def rows = grailsApplication.config?.speciesCountImport?.defaultBatchSize ?: 5
            def failedImportThreshold = grailsApplication.config?.speciesCountImport?.failedImportThreshold ?: 1000000
            def abandonImport=false
            def nPlaces;
            
            while (true) {
                def requestObj = new SearchRequestParamsDTO("", [], startIndex, rows, "", "desc")
                def searchResultsArr = bieService.searchBie(requestObj)
                if (!nPlaces){
                    nPlaces = searchResultsArr[0]?.searchResults?.totalRecords?:0;
                    jobReport.count3=nPlaces
                    nPlaces=20; //TODO
                }

                searchResultsArr[0].searchResults.results.each { rs ->           
                    
                    _dump "Place", rs

                    def place = new Place(name:rs.name);
                    place.id=rs.guid              
                    place.save(flush:true);
                
                importSpeciesCountForPlace(place, jobReport)              
                
                }
                jobReport.increaseCount0 searchResultsArr[0].searchResults.results.size()
                jobReport.save(flush:true);
            
                startIndex += rows

                if (jobReport.count2>failedImportThreshold) {
                    abandonImport = true
                    _fatalError(jobReport, "IMPORT ABANDONED. TOO MANY IMPORT FAILURES.")  
                }  
        
                if ( startIndex >= nPlaces || abandonImport) break;
            }  
       
            }
            catch(Exception e){
                _fatalError(jobReport, e)
            }
            
            jobReport.finished()
            jobReport.save(flush:true); 
        }
       
    }

    def retryFailedImportSpeciesCountCache(jobId){
        JobReport.withNewSession {
            def jobReport = JobReport.findById(jobId);
            jobReport.startRunningRetry()
            jobReport.save(flush:true)
            try{
                def places = Place.findAllByFailedImport(1)
            
                places.each { place ->           
                    importSpeciesCountForPlace(place, jobReport)              
                }   
            }
            catch(Exception e){
                _fatalError(jobReport, e)
            }
            jobReport.finished()
            jobReport.save(flush:true);        
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
                        
                jobReport.increaseCount1 lst.size()                       
                jobReport.save(flush:true);  
                                          
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
        jobReport.info = info.length()>250?info.substring(0,250):info 
        jobReport.hasError=1
        jobReport.increaseCount2 1 
        jobReport.save(flush:true)

        log.info message
    }

    private _fatalError(JobReport jobReport, Exception exception){
        log.error(exception.getMessage(), exception)
        def info = "IMPORT FATAL ERROR. "+exception.getMessage();
       
        jobReport.info= info.length()>250?info.substring(0,250):info 
        jobReport.hasError=1
        jobReport.save(flush:true)
        
    }

     private _fatalError(JobReport jobReport, String message){
        log.error(message)
        def info = "IMPORT FATAL ERROR. "+message;
        
        jobReport.info= info.length()>250?info.substring(0,250):info 
        jobReport.hasError=1
        jobReport.save(flush:true)
        
    }

    private _info(jobReport, message){
        jobReport.info = message
        jobReport.save(flush:true)

        log.info message
    }

    private _dump(title, obj){
        return;
        println "..............................DUMP ${title}...................."
        println obj
        println "..............................DUMP END...................."
    }
 
}
