package uk.org.nbn.places

import org.apache.commons.httpclient.util.URIUtil
import uk.org.nbn.places.webapp2.SearchRequestParamsDTO
import grails.converters.JSON
import org.grails.web.json.JSONObject

class BieService {

    def webService
    def grailsApplication

    def queryUsedForResults = ""

    def searchBieOnFullPlaceName(wsQueryUrl, strName) {
        def queryUrlWithoutQ = wsQueryUrl.replace('?q=' + strName, "?q=*:*")
        def matchAgainst = 'bbg_name_s'
        def toMatch = strName.replaceAll("%26","&").replaceAll("%3D","=").replaceAll("%3A",":")
        def matchFQ = matchAgainst + ":%22" + toMatch + "%22"
        def queryUrlExactMatch = queryUrlWithoutQ + "&fq=" + matchFQ

        def acceptableResults = JSON.parse("{}")

        //note: at present this is case-sensitive: need to amend SOLR schema to fix this
        def json = webService.get(queryUrlExactMatch)
        def resJson = JSON.parse(json)
        def resultsInThisPage = resJson.searchResults?.results?.size() ?: 0
        if (resultsInThisPage > 0) {
            queryUsedForResults = "fq=" + matchFQ
            acceptableResults = resJson
        }
        acceptableResults
    }

    def searchBie(SearchRequestParamsDTO requestObj) {

        def queryUrl = grailsApplication.config.bieService.baseURL + "/search?" + requestObj.getQueryString() +
                "&facets=" + grailsApplication.config.search?.facets

        //add a query context for BIE - to reduce places to a subset
        if (grailsApplication.config.bieService.queryContext) {
            queryUrl = queryUrl + "&" + URIUtil.encodeWithinQuery(grailsApplication.config.bieService.queryContext).replaceAll("%26","&").replaceAll("%3D","=").replaceAll("%3A",":")
            /* URLEncoder.encode: encoding &,= and : breaks these tokens for SOLR */
        }
        def queryParam = URIUtil.encodeWithinQuery(requestObj.q)

        queryUrl = queryUrl.replaceAll('"','%22').replaceAll("'","%27")
        log.info("queryUrlBie = " + queryUrl)

        def haveAcceptableResults = false
        def acceptableResults = JSON.parse("{}")
        def resultsInThisPage = 0
        queryUsedForResults = "q=" + queryParam

        //try exact match
        if (! haveAcceptableResults && queryParam != "" && queryParam != "*%3A*") {
            //log.info("Trying exact match...")
            acceptableResults = searchBieOnFullPlaceName(queryUrl, queryParam)
            if (acceptableResults?.searchResults) haveAcceptableResults = true
        }

        //try match on all (non-stop) words
        if (! haveAcceptableResults && queryParam != "" && queryParam != "*%3A*") {
            //match on all terms, but remove stopwords and '&'
            //these are aligned with the SOLR schema stopwords.txt
            //HACK: should be retrieve dynamically, but I don't know how to do this
            //log.info("Trying all term match...")
            def stopWords = [
                    "a","an","and","are","as","at","be","but","by","for","if","in","into","is","it","no","not","of","on","or","s","such","t","that",
                    "the","their","then","there","these","they","this","to","was","will","with"
            ]
            def qryCleanWords = requestObj.getQ().split().flatten()
            qryCleanWords.removeIf{ stopWords.contains(it.toLowerCase()) }
            qryCleanWords.removeAll("&")
            def qryWordCount = qryCleanWords.size()
            def qryClean = qryCleanWords.join(" ")

            requestObj.setQ(qryClean)
            /* in future, if fix for stemming requires not adding bbg_name_s to main text field, then move q queries to fq:bbg_name_s queries
            requestObj.setQ("*:*")
            def fqs = requestObj.getFq()
            if (fqs) {
                if (fq.getClass().metaClass.getMetaMethod("join", String)) {
                    fqs << "bbg_name_s:" + qryClean
                } else {
                    def fqlist = [fqs, "bbg_name_s:" + qryClean]
                    fqs = fqlist
                }
            } else {
                fqs = ["bbg_name_s:" + qryClean]
            }
            requestObj.setFq(fqs) */
            queryUrl = grailsApplication.config.bieService.baseURL + "/search?" + requestObj.getQueryString() + //.replaceAll("%20", "%20AND%20") +
                    "&facets=" + grailsApplication.config.search?.facets

            //add a query context for BIE - to reduce places to a subset
            if (grailsApplication.config.bieService.queryContext) {
                queryUrl = queryUrl + "&" + URIUtil.encodeWithinQuery(grailsApplication.config.bieService.queryContext).replaceAll("%26","&").replaceAll("%3D","=").replaceAll("%3A",":")
                /* URLEncoder.encode: encoding &,= and : breaks these tokens for SOLR */
            }
            queryUrl = queryUrl.replaceAll('"','%22').replaceAll("'","%27")
            if (qryWordCount > 1) {
                queryUrl += "&q_op=AND"
            }
            log.info("queryUrlBie all terms = " + queryUrl)
            def json = webService.get(queryUrl)
            acceptableResults = JSON.parse(json)
            if ((acceptableResults?.searchResults?.results?.size() ?: 0) > 0) {
                queryUsedForResults = "q=" + URIUtil.encodeWithinQuery(qryClean).replaceAll('"','%22').replaceAll("'","%27")
                log.info("queryUsedForResults = " + queryUsedForResults)
                haveAcceptableResults = true
            }
        }

        //default search
        if (! haveAcceptableResults) {
            //log.info("Trying default search...")
            def json = webService.get(queryUrl)
            def resJson = JSON.parse(json)
            //TODO: need to change sort order to best-match desc maybe?
            acceptableResults = resJson
            haveAcceptableResults = true //well, maybe
        }
        [acceptableResults, queryUsedForResults]
    }


    def getPlacesAndRecordCounts(searchResults) {
        if (!(searchResults?.searchResults?.totalRecords?:0)) {
            JSON.parse('[{"fieldResult":"[]"}]');
        } else {
            def resArray = searchResults.searchResults.results

            def guid = resArray[0].id //assume all are from same layer
            def layerDetails = getPlaceLayerDetails(guid)
            if (!layerDetails) {
                log.error "Error requesting place layer object: " + guid
                null
            } else if (layerDetails instanceof JSONObject && layerDetails.has("error")) {
                log.error "Error requesting place layer object: " + layerDetails.error
                null
            }
            def place_cl = layerDetails.fid


            def resStr = ""
            resArray.eachWithIndex { it, i ->
                if (resStr > "") resStr += ' OR '
                resStr += '"' + resArray[i].name + '"'
            }

            resStr = URLEncoder.encode("(" + resStr + ")", "UTF-8")
            def queryUrl = grailsApplication.config.biocacheService.baseURL + "/occurrence/facets?facets=" + place_cl +
                    "&fq=" + place_cl + ":" + resStr +
                    "&flimit=-1"

            queryUrl = queryUrl + getUrlFqForRecFilter()

            log.info("getPlacesAndRecordCounts query = " + queryUrl)
            def json = webService.get(queryUrl)
            //log.debug "ETC json: " + json
            try {
                JSON.parse(json)
            } catch (Exception e) {
                log.warn "Problem retrieving names and record count details"
                null
            }
        }
    }

    def getPlaceDetails(guid) {
        if (!guid && guid != "undefined") {
            return null
        }
        def json = webService.get(grailsApplication.config.bieService.baseURL + "/search?fq=guid:" + guid.replaceAll(/\s+/, '+'))
        //log.debug "ETC json: " + json
        try {
            JSON.parse(json)
        } catch (Exception e) {
            log.warn "Problem retrieving information for place: " + guid
            null
        }
    }

    def getPlaceLayerDetails(guid) {
        if (!guid && guid != "undefined") {
            return null
        }
        def json = webService.get(grailsApplication.config.layersService.baseURL + "/object/" + guid.replaceAll(/\s+/, '+'))
        //log.debug "ETC json: " + json
        try {
            JSON.parse(json)
        } catch (Exception e) {
            log.warn "Problem retrieving layer information for place: " + guid
            null
        }
    }

    //TODO: change call to factor out call to layers service
    def getPlaceSpeciesCounts(guid) {
        def layerDetails = getPlaceLayerDetails(guid)
        if (layerDetails) {
            def place_cl = (layerDetails?.fid ?: '')
            def place_clName = java.net.URLEncoder.encode((layerDetails?.name ?: ''), "UTF-8")

            def url = grailsApplication.config.biocacheService.baseURL + '/occurrence/facets?facets=lsid&q=' + place_cl + ':%22' + place_clName + '%22&flimit=0'
            url = url + getUrlFqForRecFilter()
            def jsonSpp = webService.get(url)
            try {
                def sppInfo = JSON.parse(jsonSpp)
                '{"guid":"' + guid + '", "placeCl":"' + place_cl + '", "placeClName":"' + layerDetails.name + '", "speciesCount":"' + (sppInfo?.count[0] ?: 0) + '"}'
            } catch (Exception e) {
                log.warn "Problem retrieving species count information for place: " + guid
                '{}'
            }

        } else {
            '{}'
        }
    }


    //TODO: remove
    def getTaxonConcept(guid) {
        if (!guid && guid != "undefined") {
            return null
        }
        def json = webService.get(grailsApplication.config.bieService.baseURL + "/taxon/" + guid.replaceAll(/\s+/, '+'))
        //log.debug "ETC json: " + json
        try {
            JSON.parse(json)
        } catch (Exception e) {
            log.warn "Problem retrieving information for place: " + guid
            null
        }
    }

    def getUrlFqForRecFilter () {
        def url = ""
        if (grailsApplication.config.biocacheService?.queryContext) {
            url = url + "&fq=(" + URIUtil.encodeWithinQuery(grailsApplication.config.biocacheService.queryContext).replaceAll("%26","&").replaceAll("%3D","=").replaceAll("%3A",":") + ")"

        }
        url
    }

    def getTaxonListForPlace(cl, clName, startIndex, rows, sortField) {

        //TODO: need to set reasonable flimit and implement paging?

        def url = grailsApplication.config.biocacheService.baseURL + '/occurrence/pivotStats?fq=' + cl + ':%22' + java.net.URLEncoder.encode(clName, "UTF-8") + '%22&facets=%7B!stats=piv1%7Dnames_and_lsid&apiKey=' + (grailsApplication.config.biocache?.apiKey?:'') + '&stats=%7B!tag=piv1%20max=true%7Dyear';

        url = url + getUrlFqForRecFilter()
        log.info("getTaxonListForPlace with stats before paging = " + url);
        url = url + "&fsort=" + sortField + "&flimit=" + rows + "&foffset=" + startIndex

        log.info("getTaxonListForPlace with stats = " + url);
        def json = webService.get(url)
        def tryOldWSWithoutStats = false
        if (!json || json=="{}") {
            tryOldWSWithoutStats = true
        }
        try {
            def jsonObj = JSON.parse(json)
            if (jsonObj instanceof JSONObject && jsonObj.has("error")) {
                tryOldWSWithoutStats = true
            }
            if (tryOldWSWithoutStats) {
                //try normal query URL without stats
                url = grailsApplication.config.biocacheService.baseURL + '/occurrence/facets?facets=names_and_lsid&fq=' + cl + ':%22' + java.net.URLEncoder.encode(clName, "UTF-8") + '%22&fsort=index&flimit=-1';
                url = url + getUrlFqForRecFilter()
                //log.info("getTaxonListForPlace old style = " + url);
                json = webService.get(url)
                try {
                    JSON.parse(json)
                } catch (Exception e) {
                    log.info "Problem retrieving taxa list for Place: " + clName
                    null
                }
            } else {
                jsonObj
            }
        } catch (Exception ee) {
            log.info "Problem retrieving taxa list for Place: " + clName
            null
        }
    }


    def getOccurrenceCountsForPlace(cl, clName, presenceOrAbsence, overrideAdditionalMapFilter) {

        def url = grailsApplication.config.biocacheService.baseURL + '/occurrences/search?pageSize=0&fq=' + cl + ':%22' + java.net.URLEncoder.encode(clName, "UTF-8") + '%22'

        url = url + getUrlFqForRecFilter()

        if (!overrideAdditionalMapFilter) {
            if ((grailsApplication.config?.show?.additionalMapFilter?: '') != '') {
                url = url + "&" + URIUtil.encodeWithinQuery(grailsApplication.config.show?.additionalMapFilter).replaceAll("%26","&").replaceAll("%3D","=").replaceAll("%3A",":")
            }
        }

        if (presenceOrAbsence == 'presence') {
            url = url + "&fq=-occurrence_status:absent"
        } else if (presenceOrAbsence == 'absence') {
            url = url + "&fq=occurrence_status:absent"
        }
        log.info "WS url = " + url
        def json = webService.get(url)
        try {
            def response = JSON.parse(json)
            response.get("totalRecords")
        } catch (Exception e) {
            log.info "Problem retrieving occurrence information for Place: " + clName
            null
        }
    }
}
