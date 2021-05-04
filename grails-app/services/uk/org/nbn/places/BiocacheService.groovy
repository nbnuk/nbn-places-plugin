package uk.org.nbn.places

import groovyx.net.http.HTTPBuilder
import grails.converters.JSON
import uk.org.nbn.places.webapp2.SearchRequestParamsDTO

class BiocacheService {
    static final int DEFAULT_TIMEOUT_MILLIS = 60000

    def grailsApplication
    def webService


    /**
     * Enum for image categories
     */
    public enum ImageCategory {
        TYPE, SPECIMEN, OTHER
    }

    def getQid(guids, title, def biocacheQueryContext=''){
        def http = new HTTPBuilder(grailsApplication.config.biocacheService.baseURL +"/webportal/params")

        //http.getClient().getParams().setParameter("http.socket.timeout", getTimeout())
        def query = ""

        if (guids) {
            query = "lsid:" + guids.join(" OR lsid:")
        }
        def postBody = [:]
        if (biocacheQueryContext ) {
            postBody = [q: query, fq: biocacheQueryContext, title: title]
        } else {
            postBody = [q: query, fq: grailsApplication.config.biocacheService.queryContext, title: title]
        }
        log.info "postBody = " + postBody

        try {
            http.post(body: postBody, requestContentType:groovyx.net.http.ContentType.URLENC){ resp, reader ->
                //return the location in the header
                log.debug(resp.headers?.toString())
                if (resp.status == 302) {
                    log.debug "302 redirect response from biocache"
                    return [status:resp.status, result:resp.headers['location'].getValue()]
                } else if (resp.status == 200) {
                    log.debug "200 OK response from biocache"
                    return [status:resp.status, result:reader.getText()]
                } else {
                    log.warn "$resp.status returned from biocache service"

                    return [status:500]
                }
            }
        } catch(ex) {
            log.error("Unable to get occurrences: " ,ex)
            return null;
        }
    }

    def getTimeout() {
        int timeout = DEFAULT_TIMEOUT_MILLIS
        def timeoutFromConfig = grailsApplication.config.httpTimeoutMillis
        if (timeoutFromConfig?.size() > 0) {
            timeout = timeoutFromConfig as int
        }
        timeout
    }


    /**
     * Batch search
     *
     * @param guids
     * @param title
     * @return
     */
    def performBatchSearch(guids, title, recordsFilter) {

        def resp = getQid(guids, title, recordsFilter)
        if(resp?.status == 302){
            resp.result
        } else if (resp?.status == 200) {
            log.info "200 OK response"
            def qid = resp.result

            def returnUrl = grailsApplication.config.biocache.baseURL + "/occurrences/search?q=qid:" + qid
            returnUrl

        } else {
            null
        }
    }

 
 

    def getSpeciesCounts(filterQueryList){

        String listAsString =  "[\"${filterQueryList.join('", "')}\"]"
        log.info listAsString
          def queryUrl = grailsApplication.config.biocacheService.baseURL + "/explore/groups?q=*:*"+
                        SearchRequestParamsDTO.buildFilteryQueryParams(filterQueryList)
        
            log.info("getPlaceSpeciesCounts query = " + queryUrl)
            def json = webService.get(queryUrl)
          
            
            JSON.parse(json)
    }
    
}
