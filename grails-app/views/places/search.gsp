%{--
  - Copyright (C) 2012 Atlas of Living Australia
  - All Rights Reserved.
  -
  - The contents of this file are subject to the Mozilla Public
  - License Version 1.1 (the "License"); you may not use this file
  - except in compliance with the License. You may obtain a copy of
  - the License at http://www.mozilla.org/MPL/
  -
  - Software distributed under the License is distributed on an "AS
  - IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
  - implied. See the License for the specific language governing
  - rights and limitations under the License.
  --}%
<%@ page import="au.org.ala.bie.BieTagLib" contentType="text/html;charset=UTF-8" %>
<g:set var="alaUrl" value="${grailsApplication.config.ala.baseURL}"/>
<g:set var="biocacheUrl" value="${grailsApplication.config.biocache.baseURL}"/>
<!doctype html>
<html>
<head>
    <meta name="layout" content="${grailsApplication.config.skin.layout}"/>
    <title>${query} | Search | ${raw(grailsApplication.config.skin.orgNameLong)}</title>
    <meta name="breadcrumb" content="Search results"/>
    <asset:javascript src="search"/>
    <asset:javascript src="atlas"/>
    <asset:stylesheet src="atlas"/>
    <asset:stylesheet src="search"/>
    <asset:script type="text/javascript">
        // global var to pass GSP vars into JS file
        SEARCH_CONF = {
            searchResultTotal: ${searchResults.totalRecords},
            query: "${BieTagLib.escapeJS(query)}",
            serverName: "${grailsApplication.config.grails.serverURL}",
            placesUrl: "${grailsApplication.config.places.baseURL}",
            biocacheUrl: "${grailsApplication.config.biocache.baseURL}",
            biocacheServicesUrl: "${grailsApplication.config.biocacheService.baseURL}",
            biocacheQueryContext: "${grailsApplication.config?.biocacheService.queryContext ?: ''}",
            geocodeLookupQuerySuffix: "${grailsApplication.config.geocode.querySuffix}",
            maxSpecies: ${grailsApplication.config?.search?.speciesLimit ?: 100},
            recordsFilter: "${recordsFilter}"
        }
    </asset:script>
    <g:if test="${grailsApplication.config.search?.mapResults == 'true'}">
        <g:if test="${grailsApplication.config.google.apikey}">
            <script src="https://maps.googleapis.com/maps/api/js?key=${grailsApplication.config.google.apikey}"
                    type="text/javascript"></script>
        </g:if>
        <g:else>
            <script src="https://maps.google.com/maps/api/js" type="text/javascript"></script>
        </g:else>
        <asset:javascript src="jquery.i18n.properties-1.0.9.js"/>
        <asset:javascript src="search.mapping.js"/>
        <asset:javascript src="leafletPlugins.js"/>
        <asset:stylesheet src="leafletPlugins.css"/>
    </g:if>

</head>

<body class="general-search page-search">

<section class="container">

    <header class="pg-header">
        <div class="row">
            <div class="col-sm-9">

                    <h1>
                        Search for <strong>${searchResults.queryTitle == "*:*" ? 'everything' : searchResults.queryTitle}</strong>
                        returned <g:formatNumber number="${searchResults.totalRecords}" type="number"/>
                        results
                    </h1>
            </div>
        </div>
    </header>

    <div class="section">
        <div class="row">
            <div class="col-sm-12">
                <span class="col-sm-9" >
                    <g:if test="${grailsApplication.config?.search?.includeFreeTextFilterOnResults == 'true'}">
                        <form method="get"
                              action="${grailsApplication.config.places.baseURL}${grailsApplication.config.places.searchPath}"
                              role="search" class="navbar-form form-group" style="margin-bottom:0"
                              id="freetext-filter-form">
                            <div class="input-group" style="width:100%">
                                <input type="text" autocomplete="off" placeholder="SEARCH" name="q" title="Search"
                                       class="form-control ac_input general-search" id="freetext-filter"
                                       <g:if test="${!query.isEmpty() && query != "*:*"}">value="${query.encodeAsHTML()}"</g:if>>

                                <g:if test="${params.fq}">
                                    <g:each in="${filterQuery}" var="fq">
                                        <input type="hidden" name="fq" value='${fq}'/>
                                    </g:each>
                                </g:if>

                                    <g:if test="${params.sortField}">
                                        <input type="hidden" name="sortField" value='${params.sortField}'/>
                                    </g:if>
                                    <g:if test="${params.dir}">
                                        <input type="hidden" name="dir" value='${params.dir}'/>
                                    </g:if>

                                <g:if test="${params.rows}">
                                    <input type="hidden" name="rows" value='${params.rows}'/>
                                </g:if>
                                <g:if test="${params.includeRecordsFilter}">
                                    <input type="hidden" name="includeRecordsFilter"
                                           value='${params.includeRecordsFilter}'/>
                                </g:if>
                                <span class="input-group-btn" id="freetext-filter-buttons">
                                    <input type="submit" class="form-control btn btn-primary" alt="Search"
                                           value="Search"/>
                                    <input type="reset" class="form-control btn btn-primary" alt="Reset" value="Reset"
                                           onclick="$('#freetext-filter').val('');
                                           $('#freetext-filter-form').submit();
                                           return true;"/>
                                </span>
                            </div>
                        </form>
                    </g:if>
                </span>

            </div>
        </div>
    </div>

    <div class="main-content panel panel-body">
        <g:if test="${searchResults.totalRecords}">
            <g:set var="paramsValues" value="${[:]}"/>

                <div class="row">
                    <div class="col-sm-3">

                        <div class="well refine-box">
                            <h2 class="hidden-xs">Refine results</h2>
                            <h2 class="visible-xs"><a href="#refine-options" data-toggle="collapse"><span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span> Refine results</a>
                            </h2>

                            <div id="refine-options" class="collapse mobile-collapse">
                <g:if test="${query && filterQuery}">
                    <g:set var="queryParam">q=${query.encodeAsHTML()}<g:if
                            test="${!filterQuery.isEmpty()}">&fq=${filterQuery?.join("&fq=")}</g:if></g:set>
                </g:if>
                <g:else>
                    <g:set var="queryParam">q=${query.encodeAsHTML()}<g:if
                            test="${params.fq}">&fq=${fqList?.join("&fq=")}</g:if></g:set>
                </g:else>
                <g:if test="${facetMap}">
                    <div class="current-filters" id="currentFilters">
                        <h3>Current filters</h3>
                        <ul class="list-unstyled">
                            <g:each var="item" in="${facetMap}" status="facetIdx">
                                <li>
                                    <g:if test="${item.key?.contains("uid")}">
                                        <g:set var="resourceType">${item.value}_resourceType</g:set>
                                        ${collectionsMap?.get(resourceType)}: <strong>&nbsp;${collectionsMap?.get(item.value)}</strong>
                                    </g:if>
                                    <g:else>
                                        <g:message code="facet.${item.key}" default="${item.key}"/>: <strong><g:message
                                            code="${item.key}.${item.value}" default="${item.value}"/></strong>
                                    </g:else>
                                    <a href="#" onClick="javascript:removeFacet(${facetIdx});
                                    return true;" title="remove filter"><span
                                            class="glyphicon glyphicon-remove-sign"></span></a>
                                </li>
                            </g:each>
                        </ul>
                    </div>
                </g:if>


                <!-- facets -->
                <g:each var="facetResult" in="${searchResults.facetResults}">
                    <g:if test="${!facetMap?.get(facetResult.fieldName) && !filterQuery?.contains(facetResult.fieldResult?.opt(0)?.label) && !facetResult.fieldName?.contains('idxtype1') && facetResult.fieldResult.length() > 0}">

                        <div class="refine-list" id="facet-${facetResult.fieldName}">
                            <h3><g:message code="facet.${facetResult.fieldName}"
                                           default="${facetResult.fieldName}"/></h3>
                        <ul class="list-unstyled">
                            <g:set var="lastElement"
                                   value="${facetResult.fieldResult?.get(facetResult.fieldResult.length() - 1)}"/>
                            <g:if test="${lastElement.label == 'before'}">
                                <li><g:set var="firstYear"
                                           value="${facetResult.fieldResult?.opt(0)?.label.substring(0, 4)}"/>
                                    <a href="?${queryParam}${appendQueryParam}&fq=${facetResult.fieldName}:[* TO ${facetResult.fieldResult.opt(0)?.label}]">Before ${firstYear}</a>
                                    (<g:formatNumber number="${lastElement.count}" type="number"/>)
                                </li>
                            </g:if>
                            <g:set var="hiddenValues" value="0"/>
                            <g:each var="fieldResult" in="${facetResult.fieldResult}" status="vs">
                                <g:if test="${fieldResult?.hideThisValue}">
                                    <g:set var="hiddenValues" value="${hiddenValues.toInteger()+1}"/>
                                </g:if>
                                <g:if test="${!fieldResult?.hideThisValue}">
                                    <g:if test="${(vs-hiddenValues.toInteger()) == 5 }">
                                        </ul>
                                        <ul class="collapse list-unstyled">
                                    </g:if>
                                    <g:set var="dateRangeTo"><g:if
                                            test="${vs == lastElement}">*</g:if><g:else>${facetResult.fieldResult[vs + 1]?.label}</g:else></g:set>
                                    <g:if test="${facetResult.fieldName?.contains("occurrence_date") && fieldResult.label?.endsWith("Z")}">
                                        <li><g:set var="startYear" value="${fieldResult.label?.substring(0, 4)}"/>
                                            <a href="?${queryParam}${appendQueryParam}&fq=${facetResult.fieldName}:[${fieldResult.label} TO ${dateRangeTo}]">${startYear} - ${startYear + 10}</a>
                                            (<g:formatNumber number="${fieldResult.count}" type="number"/>)</li>
                                    </g:if>
                                    <g:elseif test="${fieldResult.label?.endsWith("before")}"><%-- skip --%></g:elseif>
                                    <g:elseif test="${fieldResult.label?.isEmpty()}">
                                    </g:elseif>
                                    <g:elseif
                                            test="${fieldResult.count == (searchResults?.totalRecords ?: 0) && (grailsApplication.config.search?.hideFacetsThatDoNotFilterFurther == 'true')}">
                                    </g:elseif>
                                    <g:else>
                                        <li><a href="?${request.queryString}&fq=${facetResult.fieldName}:%22${fieldResult.label}%22">
                                            <g:message code="${facetResult.fieldName}.${fieldResult.label}"
                                                       default="${fieldResult.label ?: "[unknown]"}"/>
                                        </a>
                                            (<g:formatNumber number="${fieldResult.count}" type="number"/>)
                                        </li>
                                    </g:else>
                                </g:if>
                            </g:each>
                        </ul>
                            <g:if test="${facetResult.fieldResult.size()-hiddenValues.toInteger() > 5}">
                                <a class="expand-options" href="javascript:void(0)">
                                    More
                                </a>
                            </g:if>
                        </div>
                    </g:if>
                </g:each>
                </div><!-- refine-options -->

            </div><!-- refine-box -->
        </div>



                <div class="col-sm-9">

        <g:if test="${idxTypes.contains("TAXON") || (grailsApplication.config.nbn?.alwaysshowdownloadbutton?:'') == 'true'}">
            <div class="download-button pull-right">
                <g:set var="downloadUrl"
                       value="${grailsApplication.config.bie.index.url}/download?${request.queryString ?: ''}${((grailsApplication.config.bieService.queryContext?:'.').substring(0,1) != '&') ? "&" : "" }${grailsApplication.config.bieService.queryContext}"/>
                <a class="btn btn-default active btn-small" href="${downloadUrl}"
                   title="Download a list of places for your search">
                    <i class="glyphicon glyphicon-download"></i>
                    Download
                </a>
            </div>
        </g:if>
        <g:if test="${grailsApplication.config?.search?.mapResults == 'true'}">
            <div id="tabs" class="taxon-tabs">
                <ul class="nav nav-tabs">
                    <li class="active"><a id="t1" href="#tabs-1" data-toggle="tab">Results</a></li>
                    <li><a id="t2" href="#tabs-2" data-toggle="tab">Map</a></li>
                </ul>

                <div id="tabs-1" class="tab-content">
                    <g:include controller="tabcomponent" action="results"/>
        </g:if>

                      <div class="result-options">
                        <span class="record-cursor-details">Showing <b>${(params.offset ?: 0).toInteger() + 1} - ${Math.min((params.offset ?: 0).toInteger() + (params.rows ?: (grailsApplication.config?.search?.defaultRows ?: 10)).toInteger(), (searchResults?.totalRecords ?: 0))}</b> of <b>${searchResults?.totalRecords}</b> results</span>


                        <form class="form-inline">
                            <div class="form-group">
                                <label for="per-page">Results per page</label>
                                <select class="form-control input-sm" id="per-page" name="per-page">
                                    <option value="10" ${(params.rows == '10' || (!params.rows && grailsApplication.config?.search?.defaultRows == '10')) ? "selected=\"selected\"" : ""}>10</option>
                                    <option value="20" ${(params.rows == '20' || (!params.rows && grailsApplication.config?.search?.defaultRows == '20')) ? "selected=\"selected\"" : ""}>20</option>
                                    <option value="50" ${(params.rows == '50' || (!params.rows && grailsApplication.config?.search?.defaultRows == '50')) ? "selected=\"selected\"" : ""}>50</option>
                                    <option value="100" ${(params.rows == '100' || (!params.rows && grailsApplication.config?.search?.defaultRows == '100')) ? "selected=\"selected\"" : ""}>100</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="sort-by">Sort by</label>
                                <select class="form-control input-sm" id="sort-by" name="sort-by">
                                    <option value="score" ${(params.sortField == 'score' || (!params.sortField && grailsApplication.config?.search?.defaultSortField == 'score')) ? "selected=\"selected\"" : ""}>best match</option>
                                    <option value="name" ${(params.sortField == 'name' || (!params.sortField && grailsApplication.config?.search?.defaultSortField == 'name')) ? "selected=\"selected\"" : ""}>name</option>
                                    <option value="diocese_na_s" ${(params.sortField == 'diocese_na_s' || (!params.sortField && grailsApplication.config?.search?.defaultSortField == 'diocese_na_s')) ? "selected=\"selected\"" : ""}>diocese</option>
                                    <option value="parish_leg_s" ${(params.sortField == 'parish_leg_s' || (!params.sortField && grailsApplication.config?.search?.defaultSortField == 'parish_leg_s')) ? "selected=\"selected\"" : ""}>parish</option>
                                    <option value="function_s" ${(params.sortField == 'function_s' || (!params.sortField && grailsApplication.config?.search?.defaultSortField == 'function_s')) ? "selected=\"selected\"" : ""}>function</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="sort-order">Sort order</label>
                                <select class="form-control input-sm" id="sort-order" name="sort-order">
                                    <option value="asc" ${(params.dir == 'asc' || (!params.dir && grailsApplication.config?.search?.defaultSortOrder == 'asc')) ? "selected=\"selected\"" : ""}>ascending</option>
                                    <option value="desc" ${(params.dir == 'desc' || (!params.dir && grailsApplication.config?.search?.defaultSortOrder == 'desc') || (!params.dir && !grailsApplication.config?.search?.defaultSortOrder)) ? "selected=\"selected\"" : ""}>descending</option>
                                </select>
                            </div>

                        </form>


                        </div><!-- result-options -->


            <input type="hidden" value="${pageTitle}" name="title"/>


            <table class="table table-bordered table-striped table-condensed">
                <thead style="font-weight:bold">
                <tr>
                    <td>Name</td>
                    <td>Diocese</td>
                    <td>Parish</td>
                    <td>Function</td>

                </tr>
                </thead>
                <tbody>
                <g:each in="${searchResults.results}" status="i" var="result">
                    <tr class="${(i % 2) == 0 ? 'even' : 'odd'}">

                        <td><a href="${request.contextPath}/places/${result.guid}">${result.name}</a></td>

                        <td>${result.diocese_na_s}</td>
                        <td>${result.parish_leg_s}</td>
                        <td>${result.function_s}</td>
                    </tr>
                </g:each>
                </tbody>
            </table>


            <div>
                <tb:paginate total="${searchResults?.totalRecords}"
                             max="${params.rows ?: (grailsApplication.config?.search?.defaultRows ?: 10)}"
                             action="search"
                             params="${[q: params.q, fq: params.fq, dir: (params.dir ?: (grailsApplication.config?.search?.defaultSortOrder ?: 'desc')), sortField: (params.sortField ?: (grailsApplication.config?.search?.defaultSortField ?: 'score')), rows: (params.rows ?: (grailsApplication.config?.search?.defaultRows ?: 10))]}"/>
            </div>


            <g:if test="${grailsApplication.config?.search?.mapResults == 'true'}">
                </div>
                <div id="tabs-2" class="tab-content">
                    <g:include controller="tabcomponent" action="map"/>

                    <div class="result-options">
                        <span class="record-cursor-details">Showing <b>${(params.offset ?: 0).toInteger() + 1} - ${Math.min((params.offset ?: 0).toInteger() + (params.rows ?: (grailsApplication.config?.search?.defaultRows ?: 10)).toInteger(), (searchResults?.totalRecords ?: 0))}</b> of <b>${searchResults?.totalRecords}</b> results</span>

                        <form class="form-inline">
                            <div class="form-group">
                                <label for="per-page">Results per page</label>
                                <select class="form-control input-sm" id="per-page2" name="per-page2">
                                    <option value="10" ${(params.rows == '10' || (!params.rows && grailsApplication.config?.search?.defaultRows == '10')) ? "selected=\"selected\"" : ""}>10</option>
                                    <option value="20" ${(params.rows == '20' || (!params.rows && grailsApplication.config?.search?.defaultRows == '20')) ? "selected=\"selected\"" : ""}>20</option>
                                    <option value="50" ${(params.rows == '50' || (!params.rows && grailsApplication.config?.search?.defaultRows == '50')) ? "selected=\"selected\"" : ""}>50</option>
                                    <option value="100" ${(params.rows == '100' || (!params.rows && grailsApplication.config?.search?.defaultRows == '100')) ? "selected=\"selected\"" : ""}>100</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="sort-by">Sort by</label>
                                <select class="form-control input-sm" id="sort-by2" name="sort-by2">
                                    <option value="score" ${(params.sortField == 'score' || (!params.sortField && grailsApplication.config?.search?.defaultSortField == 'score')) ? "selected=\"selected\"" : ""}>best match</option>
                                    <option value="name" ${(params.sortField == 'name' || (!params.sortField && grailsApplication.config?.search?.defaultSortField == 'name')) ? "selected=\"selected\"" : ""}>name</option>
                                    <option value="diocese_na_s" ${(params.sortField == 'diocese_na_s' || (!params.sortField && grailsApplication.config?.search?.defaultSortField == 'diocese_na_s')) ? "selected=\"selected\"" : ""}>diocese</option>
                                    <option value="parish_leg_s" ${(params.sortField == 'parish_leg_s' || (!params.sortField && grailsApplication.config?.search?.defaultSortField == 'parish_leg_s')) ? "selected=\"selected\"" : ""}>parish</option>
                                    <option value="function_s" ${(params.sortField == 'function_s' || (!params.sortField && grailsApplication.config?.search?.defaultSortField == 'function_s')) ? "selected=\"selected\"" : ""}>function</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="sort-order">Sort order</label>
                                <select class="form-control input-sm" id="sort-order2" name="sort-order2">
                                    <option value="asc" ${(params.dir == 'asc' || (!params.dir && grailsApplication.config?.search?.defaultSortOrder == 'asc')) ? "selected=\"selected\"" : ""}>ascending</option>
                                    <option value="desc" ${(params.dir == 'desc' || (!params.dir && grailsApplication.config?.search?.defaultSortOrder == 'desc') || (!params.dir && !grailsApplication.config?.search?.defaultSortOrder)) ? "selected=\"selected\"" : ""}>descending</option>
                                </select>
                            </div>

                        </form>


                    <!-- </div> result-options -->

                        <div class="taxon-map">

                            <g:if test="${message(code: 'overview.map.button.records.map.subtitle', default: '')}">
                                <p>${g.message(code: 'overview.map.button.records.map.subtitle')}</p>
                            </g:if>
                            <div id="leafletMap"></div>
                            <!-- RR for legend display, if needed -->
                            <div id="template" style="display:none">
                                <div class="colourbyTemplate">
                                    <a class="colour-by-legend-toggle colour-by-control tooltips" href="#"
                                                    title="Map legend - click to expand"><i class="fa fa-list-ul fa-lg"
                                                                           style="color:#333"></i>
                                    </a>

                                    <form class="leaflet-control-layers-list">
                                        <div class="leaflet-control-layers-overlays">
                                            <div style="overflow:auto;max-height:400px;">
                                                <a href="#" class="hideColourControl pull-right"
                                                                            style="padding-left:10px;"><i class="glyphicon glyphicon-remove"
                                                                             style="color:#333"></i>
                                                </a>
                                                <table class="legendTable"></table>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <g:if test="${grailsApplication.config.spatial.baseURL}">
                                <g:set var="mapUrl">${grailsApplication.config.spatial.baseURL}?q=lsid:(${lsids})</g:set>
                            </g:if>
                            <g:else>
                                <g:set var="mapUrl">${biocacheUrl}/occurrences/search?q=lsid:(${lsids})#tab_mapView</g:set>
                            </g:else>
                        </div>

                       <div id="paginationTab2">
                            <tb:paginate total="${searchResults?.totalRecords}"
                                     max="${params.rows ?: (grailsApplication.config?.search?.defaultRows?:10)}"
                                     action="search"
                                     params="${[q: params.q, fq: params.fq, dir: (params.dir ?: (grailsApplication.config?.search?.defaultSortOrder?:'desc')), sortField: (params.sortField ?: (grailsApplication.config?.search?.defaultSortField?:'score')), rows: (params.rows ?: (grailsApplication.config?.search?.defaultRows?:10))]}"/>
                        </div>

                    </div>
                </div>
            </div> <!-- tabs -->
            </g:if> <!-- map tab -->

            </div><!--end .inner-->
        </g:if>

    </div> <!-- col-sm-9 -->
</section>

<div id="result-template" class="row hide">
    <div class="col-sm-12">
        <ol class="search-results-list list-unstyled">
            <li class="search-result clearfix">
                <h4><g:message code="idxtype.LOCALITY"/> : <a class="exploreYourAreaLink" href="">Address here</a></h4>
            </li>
        </ol>
    </div>
</div>


<asset:script type="text/javascript">
var SHOW_CONF = {
    biocacheUrl:        "${grailsApplication.config.biocache.baseURL}",
    biocacheServiceUrl: "${grailsApplication.config.biocacheService.baseURL}",
    layersServiceUrl:   "${grailsApplication.config.layersService.baseURL}",
    collectoryUrl:      "${grailsApplication.config.collectory.baseURL}",
    profileServiceUrl:  "${grailsApplication.config.profileService.baseURL}",
    serverName:         "${grailsApplication.config.grails.serverURL}",
    placesUrl:          "${grailsApplication.config.places.baseURL}",
    bieUrl:             "${grailsApplication.config.bie.baseURL}",
    alertsUrl:          "${grailsApplication.config.alerts.baseURL}",
    remoteUser:         "${request.remoteUser ?: ''}",
    noImage100Url:      "${resource(dir: 'images', file: 'noImage100.jpg')}",
    imageDialog:        '${imageViewerType}',
    addPreferenceButton: ${imageClient.checkAllowableEditRole()},
    speciesListUrl:     "${grailsApplication.config.speciesList.baseURL}",
    tagIfInList:        "${grailsApplication.config.search?.tagIfInList ?: ''}",
    tagIfInListHTML:    "${grailsApplication.config.search?.tagIfInListHTML ?: ''}",
    tagIfInLists:       "${grailsApplication.config.search?.tagIfInLists ?: ''}"
};

var MAP_CONF = {
    mapType:                    "search",
    biocacheServiceUrl:         "${grailsApplication.config.biocacheService.baseURL}",
    allResultsOccurrenceRecords:            ${allResultsOccurrenceRecords},
    pageResultsOccurrenceRecords:           ${pageResultsOccurrenceRecords},

    defaultDecimalLatitude:     ${grailsApplication.config.defaultDecimalLatitude ?: 0},
    defaultDecimalLongitude:    ${grailsApplication.config.defaultDecimalLongitude ?: 0},
    defaultZoomLevel:           ${grailsApplication.config.defaultZoomLevel ?: 5},
    mapAttribution:             "${raw(grailsApplication.config.skin.orgNameLong)}",
    defaultMapUrl:              "${grailsApplication.config.map.default.url}",
    defaultMapAttr:             "${raw(grailsApplication.config.map.default.attr)}",
    defaultMapDomain:           "${grailsApplication.config.map.default.domain}",
    defaultMapId:               "${grailsApplication.config.map.default.id}",
    defaultMapToken:            "${grailsApplication.config.map.default.token}",
    recordsMapColour:           "${grailsApplication.config.map.records.colour}",
    mapQueryContext:            "${grailsApplication.config?.biocacheService?.queryContext ?: ''}",
    additionalMapFilter:        "${raw(grailsApplication.config?.additionalMapFilter ?: '')}",
    map:                        null,
    mapOutline:                 ${grailsApplication.config.map.outline ?: 'false'},
    mapEnvOptions:              "name:circle;size:4;opacity:0.8",
    mapEnvLegendTitle:          "${grailsApplication.config.map.env?.legendtitle?:''}", //not used here
    mapEnvLegendHideMax:        "${grailsApplication.config.map.env?.legendhidemaxrange?:false}", //not used here
    mapLayersLabels:            "${grailsApplication.config.map.layers?.labels?:''}", //not used here
    mapLayersColours:           "${grailsApplication.config.map.layers?.colours?:''}", //not used here
    mapLayersFqs:               "${grailsApplication.config.map?.layers?.fqs ?: ''}",
    showResultsMap:             ${grailsApplication.config?.search?.mapResults == 'true'},
    mapPresenceAndAbsence:      ${grailsApplication.config?.search?.mapPresenceAndAbsence == 'true'},
    resultsToMap:               "${searchResults}",
    /* resultsNamesAndRecCounts:   "${namesAndRecCounts}", */
    resultsToMapJSON:           null,
    presenceOrAbsence:          "${(grailsApplication.config?.search?.mapPresenceAndAbsence == 'true') ? "presence" : ""}"
};


<g:if test="${grailsApplication.config.search?.mapResults == 'true'}">
    loadTheMap(MAP_CONF);
</g:if>

</asset:script>
</body>
</html>