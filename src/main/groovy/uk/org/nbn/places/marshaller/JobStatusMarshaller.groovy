package uk.org.nbn.places

import grails.converters.JSON

class JobStatusMarshaller {
    void register() {
        JSON.registerObjectMarshaller(JobStatus) {
             it.name() 
        }
    }
} 