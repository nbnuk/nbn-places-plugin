package uk.org.nbn.places

import static grails.async.Promises.*

class JobReport implements Serializable {
    String id
    Date startDate
    Date endDate
    Date lastUpdated
    String description
    JobStatus jobStatus
    String info
    int hasError
    int count0
    int count1
    int count2
    int count3

static constraints = {
    info nullable: true
    //doesnt work: endDate nullable: true
}
static mapping = {
    version false
}
    JobReport(_description){
        def now = new Date()
        description = _description;
        startDate = now;
        endDate = now; //dates can't be null
        jobStatus=JobStatus.QUEUED      
        description=description 
    }

    void startRunningRetry(){
        jobStatus=JobStatus.RUNNNIG_RETRY_FAILED_IMPORTS 
        count2=0;    
    }

    void finished(){
        if (jobStatus != JobStatus.RUNNNIG_RETRY_FAILED_IMPORTS ){ 
           endDate = new Date()
        }
        jobStatus=JobStatus.FINISHED        
    }

    void increaseCount0(amount){
        count0 += amount        
    }

    void increaseCount1(amount){
        count1 += amount        
    }
    
    void increaseCount2(amount){
        count2 += amount        
    }

    void increaseCount3(amount){
        count3 += amount        
    }
  
    String toString(){
        " ${id} startDate: ${startDate} lastUpdated: ${lastUpdated} endDate: ${endDate} ${description} ${jobStatus} hasError: ${hasError}"
    }

   
}
