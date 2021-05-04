package uk.org.nbn.places


class AdminService {

    def importService
   
    def importSpeciesCountCache(){
        def jobReport = new JobReport("Import species count cache")
        jobReport.save(flush:true);
        ImportJob importJob = new ImportJob(closure:{importService.importSpeciesCountCache(jobReport.id)})
        new Thread(importJob).start();
        return jobReport
    }   


    def retryFailedImportSpeciesCountCache(id){
        ImportJob importJob = new ImportJob(closure:{importService.retryFailedImportSpeciesCountCache(id)})
        new Thread(importJob).start();
        return "Import starting ....."
    }   

    def getLatestJobReport(){
        def lst = JobReport.list(sort:"id", order: 'desc', max: 1, ignoreCase:false);
        
        if (lst.size())
            return lst[0]
        else
            return null
    }

    //keep it simple for now:
    class ImportJob implements Runnable {
        Closure closure    

         public void run() {
            closure.call();
         }
     }

   }
