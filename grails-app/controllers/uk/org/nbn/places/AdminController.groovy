/**
 * Copyright (C) 2016 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 */
package uk.org.nbn.places

import au.org.ala.web.AlaSecured
import grails.converters.JSON

@AlaSecured(value = "ROLE_ADMIN", redirectUri = "/")
class AdminController {
   
    def placesService
    def importService
    def adminService

    def index() {}
   
    def importSpeciesCountCache(){       
        def jobReport = adminService.importSpeciesCountCache()    
        redirect action: "importJobReporter", id:jobReport.id   
    }



    def retryFailedImportSpeciesCountCache(){
        adminService.retryFailedImportSpeciesCountCache(params.id)
        return "Import starting ....."      
    }

    def importJobReporter(){ 
        render(view: 'importJobReporter', model: [
            jobReport: params.id? JobReport.findById(params.id) : adminService.getLatestJobReport(),
            messsage : "Please wait ...."
        ])
    }


    def jobProgress(){
       def response = [
            jobReport: JobReport.findById(params.id),
            date: new Date()
        ]
        render response as JSON
    }


}
