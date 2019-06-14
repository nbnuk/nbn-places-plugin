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
package au.org.ala.bie

import au.org.ala.bie.webapp2.SearchRequestParamsDTO
import grails.converters.JSON
import groovy.json.JsonSlurper
import org.apache.commons.lang.WordUtils
import org.grails.web.json.JSONObject
import org.apache.commons.lang.StringUtils


/**
 * Places Controller
 *
 * @author "Nick dos Remedios <Nick.dosRemedios@csiro.au>"
 * @author "Reuben Roberts <r.roberts@nbn.org.uk>"
 */
class PlacesController {
    // Caused by the grails structure eliminating the // from http://x.y.z type URLs
    static BROKEN_URLPATTERN = /^[a-z]+:\/[^\/].*/

    def bieService
    def utilityService
    def biocacheService
    def authService

    def recordsFilter = ''


    /*
    * Get taxon count for a place
    */
    def placeStats = {
        if (params.guid) {
            def response = bieService.getPlaceSpeciesCounts(params.guid)
            def js = new JsonSlurper()
            def results = js.parseText(response)
            JSON.use('deep') {
                render results as JSON
            }
        }
    }

    /**
    * TODO Spatial search for places using geolocation
     */
    def geoSearch = {

        def searchResults = []
        try {
            def googleMapsKey = grailsApplication.config.google?.apiKey
            def url = "https://maps.googleapis.com/maps/api/geocode/json?key=${googleMapsKey}&address=" +
                    URLEncoder.encode(params.q, 'UTF-8')
            def response = new URL(url).text
            def js = new JsonSlurper()
            def json = js.parseText(response)

            if(json.results){
                json.results.each {
                    searchResults << [
                            name: it.formatted_address,
                            latitude: it.geometry.location.lat,
                            longitude: it.geometry.location.lng
                    ]
                }
            }
        } catch (Exception e) {
            log.error(e.getMessage(), e)
        }

        JSON.use('deep') {
            render searchResults as JSON
        }
    }

    /**
    * Occurrence filter for records to include when displaying place
     */
    def getRecordsFilter() {
        //for record filter toggle
        def recordsFilter = grailsApplication.config?.biocacheService?.queryContext?:""
        return recordsFilter
    }

    /**
     * Search page - display search results (places) from the BIE
     */
    def search = {
        def query = params.q?:"".trim()
        if(query == "*") query = ""
        def filterQuery = params.list('fq') // will be a list even with only one value
        def startIndex = params.offset?:0


        def rows = params.rows ?: (grailsApplication.config?.search?.defaultRows ?: 10)

        def sortField = params.sortField?:(grailsApplication.config?.search?.defaultSortField?:"")
        def sortDirection = params.dir?:(grailsApplication.config?.search?.defaultSortOrder?:"desc")

        if (params.dir && !params.sortField) {
            sortField = "score" // default sort (field) of "score" when order is defined on its own
        }

        recordsFilter = getRecordsFilter()

        def requestObj = new SearchRequestParamsDTO(query, filterQuery, startIndex, rows, sortField, sortDirection)
        //log.info "SearchRequestParamsDTO = " + requestObj
        def searchResults = bieService.searchBie(requestObj)
        def searchResultsNamesAndRecCounts = bieService.getPlacesAndRecordCounts(searchResults)

        def sr = searchResults?.searchResults

        if ((sr?.totalRecords?:0) > 0) {
            //populate record counts
            if (searchResultsNamesAndRecCounts) {
                def siteStats = searchResultsNamesAndRecCounts[0]?.fieldResult
                if (siteStats) {
                    sr.results.each { result ->
                        def siteStat = siteStats.find { element ->
                            element.label == result.name
                        }
                        if (siteStat) {
                            result.recordCount = siteStat.count
                        } else {
                            result.recordCount = 0
                        }
                    }
                }
            }

        }

        // empty search -> search for all records
        if (query.isEmpty()) {
            query = "*:*"
        }

        if (filterQuery.size() > 1 && filterQuery.findAll { it.size() == 0 }) {
            // remove empty fq= params IF more than 1 fq param present
            def fq2 = filterQuery.findAll { it } // excludes empty or null elements
            redirect(action: "search", params: [q: query, fq: fq2, start: startIndex, rows: rows, score: sortField, dir: sortDirection])
        }

        if (searchResults instanceof JSONObject && searchResults.has("error")) {
            log.error "Error requesting region concept object: " + searchResults.error
            render(view: '../error', model: [message: searchResults.error])
        } else {

            def jsonSlurper = new JsonSlurper()
            def facetsOnlyShowValuesJson = jsonSlurper.parseText((grailsApplication.config.search?.facetsOnlyShowValues ?: "[]"))

            if (searchResults?.searchResults) {
                searchResults.searchResults.facetResults.each { facetRes ->
                    facetRes.fieldResult.each { fieldRes ->
                        facetsOnlyShowValuesJson.each { facetFilter ->
                            if (facetRes.fieldName == facetFilter.facet) {
                                if (!facetFilter.values.contains(fieldRes.fieldValue)) {
                                    fieldRes.hideThisValue = true
                                }
                            }
                        }
                    }
                }
            }

            render(view: 'search', model: [
                    searchResults: searchResults?.searchResults,
                    facetMap: utilityService.addFacetMap(filterQuery),
                    query: query?.trim(),
                    filterQuery: filterQuery,
                    collectionsMap: utilityService.addFqUidMap(filterQuery)
            ])
        }
    }

    def extractVals( String input ) {
        input.findAll( /-?\d+\.\d*|-?\d*\.\d+|-?\d+/ )*.toDouble()
    }

    /**
     * Place page - display information about the requested place
     *
     * Places are loaded into the BIE database with idxtype REGION or (more usually) REGIONFEATURED
     * Their details can be retrieved using the bie-index service, e.g. https://species-ws.nbnatlas.org/search?fq=id:8313254
     * This is due to modifications to bie-index that indexes properties from the shapefile that is loaded into the layers store
     *
     */
    def show = {
        def guid = regularise(params.guid)

        def placeDetails = bieService.getPlaceDetails(guid)
        log.info "show - guid = ${guid} "

        def recordsFilter = getRecordsFilter()

        if (!placeDetails) {
            log.error "Error requesting place concept object: " + guid
            response.status = 404
            render(view: '../error', model: [message: "Requested place <b>" + guid + "</b> was not found"])
        } else if (placeDetails instanceof JSONObject && placeDetails.has("error")) {
            if (placeDetails.error?.contains("FileNotFoundException")) {
                log.error "Error requesting place concept object: " + guid
                response.status = 404
                render(view: '../error', model: [message: "Requested place <b>" + guid + "</b> was not found"])
            } else {
                log.error "Error requesting place concept object: " + placeDetails.error
                render(view: '../error', model: [message: placeDetails.error])
            }
        } else if ((placeDetails?.searchResults?.totalRecords?:0) != 1) {
            log.error "Error requesting place concept object: " + (placeDetails?.searchResults?.totalRecords?:0) + " found"
            render(view: '../error', model: [message: (placeDetails?.searchResults?.totalRecords?:0) + " found"])

        } else {
            def layerDetails = bieService.getPlaceLayerDetails(guid)
            if (!layerDetails) {
                log.error "Error requesting place layer object: " + guid
                response.status = 404
                render(view: '../error', model: [message: "Requested layer for place <b>" + guid + "</b> was not found"])
            } else if (layerDetails instanceof JSONObject && layerDetails.has("error")) {
                log.error "Error requesting place layer object: " + layerDetails.error
                render(view: '../error', model: [message: layerDetails.error])
            }
            def place_cl = layerDetails.fid
            def place_clName = layerDetails.name

            def placeTaxonList = bieService.getTaxonListForPlace(place_cl, place_clName)

            def pageResultsOccsPresence = bieService.getOccurrenceCountsForPlace(place_cl, place_clName, "presence", false)
            def pageResultsOccsAbsence = bieService.getOccurrenceCountsForPlace(place_cl, place_clName, "absence", false)
            def allResultsOccs = pageResultsOccsPresence + pageResultsOccsAbsence
            if (pageResultsOccsPresence == null) {
                pageResultsOccsPresence = -1
                allResultsOccs = -1
            }
            if (pageResultsOccsAbsence == null) {
                pageResultsOccsAbsence = -1
                allResultsOccs = -1
            }
            def pageResultsOccs = allResultsOccs
            def allResultsOccsNoMapFilter = 0
            if ((grailsApplication.config?.show?.mapPresenceAndAbsence?:"") == "true") {
                //have all info needed
            } else {
                if (grailsApplication.config?.map?.additionalMapFilter == "fq=occurrence_status:present" || grailsApplication.config?.show?.additionalMapFilter == "fq=-occurrence_status:present") {
                    //for these common options don't make *another* web service call
                    allResultsOccsNoMapFilter = allResultsOccs
                } else {
                    allResultsOccsNoMapFilter = bieService.getOccurrenceCountsForPlace(place_cl, place_clName, "all", true)
                    if (allResultsOccsNoMapFilter == null) allResultsOccsNoMapFilter = -1
                }
            }
            def jsonSlurper = new JsonSlurper()
            //search results JSON object to match that returned for list from jsonSlurper.parseText()
            def searchResults = '{ "results": [{"occurrenceCount":"' + allResultsOccs + '", "cl":"' + place_cl + '", "name":"' + place_clName + '", "guid":"' + guid + '", "scientificName":"notused"}] }'
            def searchResultsPresence = '{ "results": [{"occurrenceCount":"' + pageResultsOccsPresence + '", "cl":"' + place_cl + '", "name":"' + place_clName + '", "guid":"' + guid + '", "scientificName":"notused"}] }'
            def searchResultsAbsence = '{ "results": [{"occurrenceCount":"' + pageResultsOccsAbsence + '", "cl":"' + place_cl + '", "name":"' + place_clName + '", "guid":"' + guid + '", "scientificName":"notused"}] }'


            def centroid = extractVals(placeDetails.searchResults.results[0]?.centroid ?: 'POINT(999 999)')

            def baseMaps = jsonSlurper.parseText(grailsApplication.config?.mapdownloads?.baseMaps?:'{}')
            def baseLayers = jsonSlurper.parseText(grailsApplication.config?.mapdownloads?.baseLayers?:'{}')

            render(view: 'show', model: [
                    placeDetails: placeDetails.searchResults.results[0],
                    cl: place_cl,
                    clName: java.net.URLEncoder.encode(place_clName, "UTF-8"),
                    centroid: centroid,
                    searchResults: searchResults,
                    searchResultsPresence: searchResultsPresence,
                    searchResultsAbsence: searchResultsAbsence,
                    taxonList: placeTaxonList,
                    allResultsOccurrenceRecords: allResultsOccs,
                    allResultsOccurrenceRecordsNoMapFilter: allResultsOccsNoMapFilter,
                    pageResultsOccurrenceRecords: pageResultsOccs,
                    pageResultsOccurrencePresenceRecords: pageResultsOccsPresence,
                    pageResultsOccurrenceAbsenceRecords: pageResultsOccsAbsence,
                    recordsFilterToggle: params.includeRecordsFilter ?: "",
                    recordsFilter: recordsFilter,
                    baseMaps: baseMaps,
                    baseLayers: baseLayers
            ])
        }
    }

    /**
     * Display images of species for a given place
     * Note: page is AJAX driven so very little is done here.
     * TODO: do this one
     */
    def imageSearch = {
        def model = [:]
        if(params.id){
            def taxon = bieService.getTaxonConcept(regularise(params.id))
            model["taxonConcept"] = taxon
        }
        model
    }

    /**
     * Do logouts through this app so we can invalidate the session.
     *
     * @param casUrl the url for logging out of cas
     * @param appUrl the url to redirect back to after the logout
     */
    def logout = {
        session.invalidate()
        redirect(url:"${params.casUrl}?url=${params.appUrl}")
    }

    private regularise(String guid) {
        if (!guid)
            return guid
        if (guid ==~ BROKEN_URLPATTERN) {
            guid = guid.replaceFirst(":/", "://")
        }
        return guid
    }

}