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
 */
class PlacesController {
    // Caused by the grails structure eliminating the // from http://x.y.z type URLs
    static BROKEN_URLPATTERN = /^[a-z]+:\/[^\/].*/

    def bieService
    def utilityService
    def biocacheService
    def authService

    def allResultsGuids = []
    def allResultsOccs = 0
    def allResultsOccsNoMapFilter = 0
    def pageResultsOccs = 0
    def pageResultsOccsPresence = 0
    def pageResultsOccsAbsence = 0
    def recordsFilter = ''



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

    def getRecordsFilter() {
        //for record filter toggle
        def recordsFilter = grailsApplication.config?.biocacheService?.queryContext?:""
        return recordsFilter
    }

    /**
     * Search page - display search results (featured regions) from the BIE
     */
    def search = {
        def query = params.q?:"".trim()
        if(query == "*") query = ""
        def filterQuery = params.list('fq') // will be a list even with only one value
        def startIndex = params.offset?:0


        def rows = params.rows ?: (grailsApplication.config?.search?.defaultRows ?: 10)

        def sortField = params.sortField?:(grailsApplication.config?.search?.defaultSortField?:"")
        def sortDirection = params.dir?:(grailsApplication.config?.search?.defaultSortOrder?:"desc")
        //log.info "SortField= " + sortField
        //log.info "SortDir= " + sortDirection
        if (params.dir && !params.sortField) {
            sortField = "score" // default sort (field) of "score" when order is defined on its own
        }

        recordsFilter = getRecordsFilter()

        def requestObj = new SearchRequestParamsDTO(query, filterQuery, startIndex, rows, sortField, sortDirection)
        log.info "SearchRequestParamsDTO = " + requestObj
        def searchResults = bieService.searchBie(requestObj)
        def searchResultsNamesAndRecCounts = bieService.getPlacesAndRecordCounts(searchResults)

        def lsids = ""
        def sr = searchResults?.searchResults

        if ((sr?.totalRecords?:0) > 0) {
            sr.results.each { result ->
                lsids += (lsids != "" ? "%20OR%20" : "") + result.guid
            }
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
            setResultStats(searchResults)

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
                    namesAndRecCounts: searchResultsNamesAndRecCounts[0]?.fieldResult,
                    facetMap: utilityService.addFacetMap(filterQuery),
                    query: query?.trim(),
                    filterQuery: filterQuery,
                    idxTypes: utilityService.getIdxtypes(searchResults?.searchResults?.facetResults),
                    isAustralian: false,
                    collectionsMap: utilityService.addFqUidMap(filterQuery),
                    lsids: lsids,
                    offset: startIndex,
                    allResultsOccurrenceRecords: allResultsOccs,
                    pageResultsOccurrenceRecords: pageResultsOccs,
                    recordsFilterToggle: params.includeRecordsFilter ?: "",
                    recordsFilter: recordsFilter,
                    facetsOnlyShowValues: facetsOnlyShowValuesJson
            ])
        }
    }

    def extractVals( String input ) {
        input.findAll( /-?\d+\.\d*|-?\d*\.\d+|-?\d+/ )*.toDouble()
    }

    /**
     * Species page - display information about the requested taxa
     *
     * TAXON: a taxon is 'any group or rank in a biological classification in which organisms are related.'
     * It is also any of the taxonomic units. So basically a taxon is a catch-all term for any of the
     * classification rankings; i.e. domain, kingdom, phylum, etc.
     *
     * TAXON CONCEPT: A taxon concept defines what the taxon means - a series of properties
     * or details about what we mean when we use the taxon name.
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
            if ((grailsApplication.config?.species?.mapPresenceAndAbsence?:"") == "true") {
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
            //search results JSON object to look like that returned for species search list jsonSlurper.parseText(
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
                    statusRegionMap: utilityService.getStatusRegionCodes(),
                    infoSourceMap:[],
                    textProperties: [],
                    isAustralian: false,
                    isRoleAdmin: false, //authService.userInRole(grailsApplication.config.auth.admin_role),
                    userName: "",
                    isReadOnly: grailsApplication.config.ranking.readonly,
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
     * Display images of species for a given higher taxa.
     * Note: page is AJAX driven so very little is done here.
     */
    def imageSearch = {
        def model = [:]
        if(params.id){
            def taxon = bieService.getTaxonConcept(regularise(params.id))
            model["taxonConcept"] = taxon
        }
        model
    }

    def soundSearch = {
        def result = biocacheService.getSoundsForTaxon(params.s)
        render(contentType: "text/json") {
            result
        }
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

    /**
     * Note, 'all results' means up to the config search.speciesLimit value (which may differ from the page size)
     */
    def setResultStats (pageResults) {
        allResultsGuids = []
        allResultsOccs = 0
        pageResultsOccs = 0


        def sr
        def rows = params.rows?:(grailsApplication.config?.search?.defaultRows?:10)
        def rowsMax = grailsApplication.config?.search?.speciesLimit ?: 100
        if ((pageResults?.searchResults?.totalRecords ?: 0) > rows.toInteger()) { //must load all results
            // its horrible to call twice, once for single page and once for all results, but that seems to be what we have to do
            def query = params.q ?: "".trim()
            if (query == "*") query = ""
            def filterQuery = params.list('fq') // will be a list even with only one value
            def recordsFilter = getRecordsFilter()

            def sortField = params.sortField ?: (grailsApplication.config?.search?.defaultSortField ?: "")
            def sortDirection = params.dir ?: (grailsApplication.config?.search?.defaultSortOrder ?: "desc")

            if (params.dir && !params.sortField) {
                sortField = "score" // default sort (field) of "score" when order is defined on its own
            }

            def requestObj = new SearchRequestParamsDTO(query, filterQuery, 0, rowsMax, sortField, sortDirection)
            log.info "SearchRequestParamsDTO = " + requestObj
            def searchResults = bieService.searchBie(requestObj)

            sr = searchResults?.searchResults
        } else {
            sr = pageResults?.searchResults
        }
        if (sr) {
            sr.results.each { result ->
                allResultsGuids << result.guid
                allResultsOccs += result?.occurrenceCount?: 0
            }
        }
        sr = pageResults?.searchResults
        if (sr) {
            sr.results.each { result ->
                pageResultsOccs += result?.occurrenceCount?: 0
            }
        }

    }



    def occurrences(){
        def title = "TODO: INNS species" //TODO
        //getAllResults()

        def url = biocacheService.performBatchSearch(allResultsGuids, title, recordsFilter)

        if(url){
            redirect(url:url)
        } else {
            redirect(controller: "species", action: "search") //TODO: need to pass URL filter params to this?
        }
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