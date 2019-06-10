package au.org.ala.bie

import au.org.ala.bie.webapp2.SearchRequestParamsDTO
import grails.converters.JSON
import org.grails.web.json.JSONObject

class BieService {

    def webService
    def grailsApplication



    //additional filter on occurrence records to get different occurrenceCount values for e.g. occurrence_status:absent records
    //also allows override of biocache.queryContext if occFilter includes the needed filter already
    //def searchBieOccFilter(SearchRequestParamsDTO requestObj, String occFilter, Boolean overrideBiocacheContext) {
    def searchBieOccFilter(SearchRequestParamsDTO requestObj, occFilter, overrideBiocacheContext) {

        def queryUrl = grailsApplication.config.bie.index.url + "/search?" + requestObj.getQueryString() +
                "&facets=" + grailsApplication.config.facets
        queryUrl += "&q.op=OR"

        //add a query context for BIE - to reduce taxa to a subset
        if (grailsApplication.config.bieService.queryContext) {

            queryUrl = queryUrl + "&" + grailsApplication.config.bieService.queryContext.replaceAll(" ", "%20")
            /* URLEncoder.encode: encoding &,= and : breaks these tokens for SOLR */
        }

        //queryUrl = queryUrl.replace("\"","%34").replace("+","%20")

        //add a query context for biocache - this will influence record counts
        if (!overrideBiocacheContext) {
            if (grailsApplication.config.biocacheService.queryContext) {
                //watch out for mutually exclusive conditions between queryContext and occFilter, e.g. if queryContext=occurrence_status:present and occFilter=occurrence_stats:absent then will get zero records returned
                queryUrl = queryUrl + "&bqc=(" + (grailsApplication.config.biocacheService.queryContext).replaceAll(" ", "%20")
                if (occFilter) {
                    queryUrl = queryUrl + "%20AND%20" + occFilter.replaceAll(" ", "%20")
                }
                queryUrl = queryUrl + ")"
            } else {
                if (occFilter) {
                    queryUrl = queryUrl + "&bqc=(" + occFilter.replaceAll(" ", "%20")
                }
            }
        } else {
            if (occFilter) {
                queryUrl = queryUrl + "&bqc=(" + occFilter.replaceAll(" ", "%20") + ")"
            }
        }

        queryUrl = queryUrl.replace("\"","%22")
        log.info("queryUrlOccFilter = " + queryUrl)

        def json = webService.get(queryUrl)
        JSON.parse(json)
    }


    def getPlacesAndRecordCounts(searchResults) {
        if (!(searchResults?.searchResults?.totalRecords?:0)) {
            null
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

            log.info(queryUrl)
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
        def json = webService.get(grailsApplication.config.bie.index.url + "/search?fq=guid:" + guid.replaceAll(/\s+/, '+'))
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

    def getPlaceRecordAndSpeciesCounts(guid) {
        def layerDetails = getPlaceLayerDetails(guid)
        if (layerDetails) {
            def place_cl = (layerDetails?.fid?:'')
            def place_clName = (layerDetails?.name?:'').replace('&','%26').replace(' ','%20')
            def jsonRec = webService.get(grailsApplication.config.biocacheService.baseURL + '/occurrences/search?fq=' + place_cl + ':%22' + place_clName + '%22&pageSize=0')
            if (jsonRec) {
                try {
                    def recInfo = JSON.parse(jsonRec)
                    def jsonSpp = webService.get(grailsApplication.config.biocacheService.baseURL + '/occurrence/facets?facets=lsid&q=' + place_cl + ':%22' + place_clName + '%22&flimit=0')
                    try {
                        def sppInfo = JSON.parse(jsonSpp)
                        '{"guid":"' + guid + '", "placeCl":"' + place_cl + '", "placeClName":"' + layerDetails.name + '", "recordCount":"' + (recInfo?.totalRecords ?: 0) + '", "speciesCount":"' + (sppInfo?.count[0] ?: 0) + '"}'
                    } catch (Exception e) {
                        log.warn "Problem retrieving species count information for place: " + guid
                        '{}'
                    }
                } catch (Exception e) {
                    log.warn "Problem retrieving record count information for place: " + guid
                    '{}'
                }
            } else {
                '{}'
            }
        } else {
            '{}'
        }
    }



    def getTaxonConcept(guid) {
        if (!guid && guid != "undefined") {
            return null
        }
        def json = webService.get(grailsApplication.config.bie.index.url + "/taxon/" + guid.replaceAll(/\s+/, '+'))
        //log.debug "ETC json: " + json
        try {
            JSON.parse(json)
        } catch (Exception e) {
            log.warn "Problem retrieving information for place: " + guid
            null
        }
    }

    def getClassificationForGuid(guid) {
        def url = grailsApplication.config.bie.index.url + "/classification/" + guid.replaceAll(/\s+/, '+')
        def json = webService.getJson(url)
        log.debug "json type = " + json
        if (json instanceof JSONObject && json.has("error")) {
            log.warn "classification request error: " + json.error
            return [:]
        } else {
            log.debug "classification json: " + json
            return json
        }
    }

    def getChildConceptsForGuid(guid) {
        def url = grailsApplication.config.bie.index.url + "/childConcepts/" + guid.replaceAll(/\s+/, '+')

        if (grailsApplication.config.bieService.queryContext) {
            url = url + "?" + URLEncoder.encode(grailsApplication.config.bieService.queryContext, "UTF-8")
        }

        def json = webService.getJson(url).sort() { it.rankID ?: 0 }

        if (json instanceof JSONObject && json.has("error")) {
            log.warn "child concepts request error: " + json.error
            return [:]
        } else {
            log.debug "child concepts json: " + json
            return json
        }
    }

    def getOccurrenceCountsForGuid(guid, presenceOrAbsence, occFilter, overrideBiocacheContext, overrideAdditionalMapFilter) {

        def url = grailsApplication.config.biocacheService.baseURL + '/occurrences/taxaCount?guids=' + guid.replaceAll(/\s+/, '+')

        //add a query context for biocache - this will influence record counts
        if (!overrideBiocacheContext) {
            if (grailsApplication.config.biocacheService?.queryContext) {
                url = url + "&fq=(" + (grailsApplication.config.biocacheService.queryContext).replaceAll(" ", "%20")
                if (occFilter) {
                    url = url + "%20AND%20" + occFilter.replaceAll(" ", "%20")
                }
                url = url + ")"
            } else {
                if (occFilter) {
                    url = url + "&fq=(" + occFilter.replaceAll(" ", "%20") + ")"
                }
            }
        } else {
            if (occFilter) {
                url = url + "&fq=(" + occFilter.replaceAll(" ", "%20") + ")"
            }
        }

        if (!overrideAdditionalMapFilter) {
            if (grailsApplication.config?.additionalMapFilter) {
                url = url + "&" + grailsApplication.config.additionalMapFilter.replaceAll(" ", "%20")
            }
        }

        if (presenceOrAbsence == 'presence') {
            url = url + "&fq=-occurrence_status:absent"
        } else if (presenceOrAbsence == 'absence') {
            url = url + "&fq=occurrence_status:absent"
        }
        def json = webService.get(url)
        try {
            def response = JSON.parse(json)
            Iterator<?> keys = response.keys();
            String key = (String) keys.next()
            response.get(key)
        } catch (Exception e) {
            log.info "Problem retrieving occurrence information for Taxon: " + guid
            null
        }
    }

    def getOccurrenceCountsForPlace(cl, clName, presenceOrAbsence, occFilter, overrideBiocacheContext, overrideAdditionalMapFilter) {

        def url = grailsApplication.config.biocacheService.baseURL + '/occurrences/search?pageSize=0&fq=' + cl + ':"' + clName.replaceAll(/\s+/, '+').replaceAll(/&/, '%26') + '"'

        //add a query context for biocache - this will influence record counts
        if (!overrideBiocacheContext) {
            if (grailsApplication.config.biocacheService?.queryContext) {
                url = url + "&fq=(" + (grailsApplication.config.biocacheService.queryContext).replaceAll(" ", "%20")
                if (occFilter) {
                    url = url + "%20AND%20" + occFilter.replaceAll(" ", "%20")
                }
                url = url + ")"
            } else {
                if (occFilter) {
                    url = url + "&fq=(" + occFilter.replaceAll(" ", "%20") + ")"
                }
            }
        } else {
            if (occFilter) {
                url = url + "&fq=(" + occFilter.replaceAll(" ", "%20") + ")"
            }
        }

        if (!overrideAdditionalMapFilter) {
            if (grailsApplication.config?.additionalMapFilter) {
                url = url + "&" + grailsApplication.config.additionalMapFilter.replaceAll(" ", "%20")
            }
        }

        if (presenceOrAbsence == 'presence') {
            url = url + "&fq=-occurrence_status:absent"
        } else if (presenceOrAbsence == 'absence') {
            url = url + "&fq=occurrence_status:absent"
        }
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