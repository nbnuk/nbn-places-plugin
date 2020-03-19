%{--
  - Copyright (C) 2014 Atlas of Living Australia
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
<%@ page contentType="text/html;charset=UTF-8" %>
<g:set var="alaUrl" value="${grailsApplication.config.ala.baseURL}"/>
<g:set var="biocacheUrl" value="${grailsApplication.config.biocache.baseURL}"/>
<g:set var="bieUrl" value="${grailsApplication.config.bie.baseURL}"/>
<g:set var="placesUrl" value="${grailsApplication.config.places.baseURL}"/>
<g:set var="spatialPortalUrl" value="${grailsApplication.config.spatial.baseURL}"/>
<g:set var="collectoryUrl" value="${grailsApplication.config.collectory.baseURL}"/>
<g:set var="alertsUrl" value="${grailsApplication.config.alerts.baseURL}"/>
<g:set var="guid" value="${placeDetails?.guid ?: ''}"/>
<g:set var="tabs" value="${grailsApplication.config.show.tabs.split(',')}"/>
<g:set var="placeNameFormatted" value="${placeDetails?.name ?: 'unknown'}"/>
<g:set var="locale" value="${org.springframework.web.servlet.support.RequestContextUtils.getLocale(request)}"/>
<g:set bean="authService" var="authService"></g:set>
<g:set var="imageViewerType" value="${grailsApplication.config.imageViewerType?:'LEAFLET'}"></g:set>
<g:set var="shape_filter" value="${cl + ':"' + clName + '"'}"></g:set>
<g:set var="placeDetails" value="${placeDetails}"></g:set>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${placeDetails?.name} | ${raw(grailsApplication.config.skin.orgNameLong)}</title>
    <meta name="layout" content="${grailsApplication.config.skin.layout}"/>
    <g:if test="${grailsApplication.config.google.apiKey}">
    <script src="https://maps.googleapis.com/maps/api/js?key=${grailsApplication.config.google.apiKey}"
            type="text/javascript"></script>
</g:if>
    <g:else>
        <script src="https://maps.google.com/maps/api/js" type="text/javascript"></script>
    </g:else>
    <asset:javascript src="show"/>
    <asset:stylesheet src="show"/>
    <asset:javascript src="show.mapping.js"/>
    <asset:javascript src="charts"/>
    <asset:stylesheet src="charts"/>
    <asset:javascript src="ala/images-client.js"/>
    <asset:stylesheet src="ala/images-client.css"/>
    <asset:javascript src="ala/images-client-gallery.js"/>
    <asset:stylesheet src="ala/images-client-gallery.css"/>
    <asset:javascript src="jquery.i18n.properties-1.0.9.js" />
    <asset:javascript src="leafletPlugins.js"/>
    <asset:stylesheet src="leafletPlugins.css"/>

    <asset:stylesheet src="exploreYourArea.css" />
    <asset:stylesheet src="print-area.css" media="print" />
</head>

<body class="page-taxon">
<section class="container">
    <header class="pg-header">
        <div class="header-inner">

                <h5 class="pull-right" style="clear:right">
                    <a href="${request.getAttribute("search_page")}"
                       title="Back to search" class="btn btn-sm btn-default active">Back to search</a>
                </h5>


            <h1>${raw(placeNameFormatted)}</h1>

            <g:if test="${grailsApplication.config.show?.additionalHeadlines}">
                <g:each var="fieldToDisplay" in="${grailsApplication.config.show.additionalHeadlines.split(",")}">
                    <g:if test='${placeDetails."${fieldToDisplay}"}'>
                        <h5 class="inline-head"><strong><g:message code="facet.${fieldToDisplay}" default="${fieldToDisplay}"/>:</strong>
                        <span class="place-headline-${fieldToDisplay}">${placeDetails."${fieldToDisplay}"}</span></h5>
                    </g:if>
                </g:each>
            </g:if>
        </div>
    </header>

    <div id="main-content" class="main-content panel panel-body">
        <div class="place-tabs">
            <ul class="nav nav-tabs">
                <g:each in="${tabs}" status="ts" var="tab">
                    <li class="${ts == 0 ? 'active' : ''}"><a href="#${tab}" data-toggle="tab"><g:message
                            code="label.${tab}" default="${tab}"/></a></li>
                </g:each>
            </ul>
            <div class="tab-content">
                <g:each in="${tabs}" status="ts" var="tab">
                    <g:render template="${tab}"/>
                </g:each>
            </div>
        </div>
    </div><!-- end main-content -->
</section>

<!-- taxon-summary-thumb template -->
<div id="taxon-summary-thumb-template"
     class="taxon-summary-thumb hide"
     style="">
    <a data-toggle="lightbox"
       data-gallery="taxon-summary-gallery"
       data-parent=".taxon-summary-gallery"
       data-title=""
       data-footer=""
       href="">
    </a>
</div>

<!-- thumbnail template -->
<a id="taxon-thumb-template"
   class="taxon-thumb hide"
   data-toggle="lightbox"
   data-gallery="main-image-gallery"
   data-title=""
   data-footer=""
   href="">
    <img src="" alt="">

    <div class="thumb-caption caption-brief"></div>

    <div class="thumb-caption caption-detail"></div>
</a>

<!-- description template -->
<div id="descriptionTemplate" class="panel panel-default panel-description" style="display:none;">
    <div class="panel-heading">
        <h3 class="panel-title title"></h3>
    </div>

    <div class="panel-body">
        <p class="content"></p>
    </div>

    <div class="panel-footer">
        <p class="source">Source: <span class="sourceText"></span></p>

        <p class="rights">Rights holder: <span class="rightsText"></span></p>

        <p class="provider">Provided by: <a href="#" class="providedBy"></a></p>
    </div>
</div>

<div id="descriptionCollapsibleTemplate" class="panel panel-default panel-description" style="display:none;">
    <div class="panel-heading">
        <a href="#" class="showHidePageGroup" data-name="0" style="text-decoration: none"><span class="caret right-caret"></span>
        <h3 class="panel-title title" style="display:inline"></h3></a>
    </div>
    <div class="facetsGroup" id="group_0" style="display:none">
        <div class="panel-body">
            <p class="content"></p>
        </div>

        <div class="panel-footer">
            <p class="source">Source: <span class="sourceText"></span></p>

            <p class="rights">Rights holder: <span class="rightsText"></span></p>

            <p class="provider">Provided by: <a href="#" class="providedBy"></a></p>
        </div>
    </div>
</div>

<div id="imageDialog" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-body">
                <div id="viewerContainerId">

                </div>
            </div>
        </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
</div>

<div id="alertModal" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-body">
                <div id="alertContent">

                </div>
                <!-- dialog buttons -->
                <div class="modal-footer"><button type="button" class="btn btn-primary" data-dismiss="modal">OK</button></div>
            </div>
        </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
</div>

<div id="recordPopup" style="display:none;">
    <a href="#"><g:message code="overview.map.recordpopup" default="View records at this point"/></a>
</div>

<asset:script type="text/javascript">


    // Global var to pass GSP vars into JS file
    var SHOW_CONF = {
        cl:                         "${cl}",
        clName:                     "${clName}",
        shape_filter:               "${cl}:\"${clName}\"",
        centroid:                   "${centroid}",
        biocacheUrl:        "${grailsApplication.config.biocache.baseURL}",
        biocacheServiceUrl: "${grailsApplication.config.biocacheService.baseURL}",
        biocacheQueryContext: "${grailsApplication.config.biocacheService?.queryContext?:""}",
        layersServiceUrl:   "${grailsApplication.config.layersService.baseURL}",
        collectoryUrl:      "${grailsApplication.config.collectory.baseURL}",
        imageServiceBaseUrl:"${grailsApplication.config.image.baseURL}",
        guid:               "${guid}",
        placeName:          "${placeDetails?.bbg_name_s ?: ''}",
        preferredImageId:   "TODO_img",
        serverName:         "${grailsApplication.config.grails.serverURL}",
        bieUrl:             "${grailsApplication.config.bie.baseURL}",
        placesUrl:          "${grailsApplication.config.places.baseURL}",
        alertsUrl:          "${grailsApplication.config.alerts.baseURL}",
        remoteUser:         "${request.remoteUser ?: ''}",
        noImage100Url:      "${resource(dir: 'images', file: 'noImage100.jpg')}",
        imageDialog:        '${imageViewerType}',
        likeUrl:            "${createLink(controller: 'imageClient', action: 'likeImage')}",
        dislikeUrl:         "${createLink(controller: 'imageClient', action: 'dislikeImage')}",
        userRatingUrl:      "${createLink(controller: 'imageClient', action: 'userRating')}",
        disableLikeDislikeButton: ${authService.getUserId() ? false : true},
        userRatingHelpText: '<div><b>Up vote (<i class="fa fa-thumbs-o-up" aria-hidden="true"></i>) an image:</b>'+
        ' Image supports the identification of the species or is representative of the species.  Subject is clearly visible including identifying features.<br/><br/>'+
        '<b>Down vote (<i class="fa fa-thumbs-o-down" aria-hidden="true"></i>) an image:</b>'+
        ' Image does not support the identification of the species, subject is unclear and identifying features are difficult to see or not visible.<br/><br/></div>',
        savePreferredSpeciesListUrl: "${createLink(controller: 'imageClient', action: 'saveImageToSpeciesList')}",
        getPreferredSpeciesListUrl: "${grailsApplication.config.speciesList.baseURL}",
        druid: "${grailsApplication.config.speciesList.preferredSpeciesListDruid}",
        addPreferenceButton: ${imageClient.checkAllowableEditRole()},
        organisationName: "${grailsApplication.config.skin?.orgNameLong}",
        contextPath: "${request.contextPath}",
        locale: "${org.springframework.web.servlet.support.RequestContextUtils.getLocale(request)}",
        image_page_white_go: "${assetPath(src: 'page_white_go.png')}",
        image_database_go: "${assetPath(src: 'database_go.png')}"
};

var MAP_CONF_ABOUT = {
        mapType:                    "show",
        cl:                         "${cl}",
        clName:                     "${clName}",
        shape_filter:               "${cl}:\"${clName}\"",
        centroid:                   ${centroid},
        shp_sw:                     ${shp_sw},
        shp_ne:                     ${shp_ne},
        defaultShapeZoom:           ${grailsApplication.config.map?.default?.shapeZoomLevel ?: 10},
        biocacheServiceUrl:         "${grailsApplication.config.biocacheService.baseURL}",
        biocacheUrl:                "${grailsApplication.config.biocache.baseURL}",
        allResultsOccurrenceRecords:            ${allResultsOccurrenceRecords},
        allResultsOccurrenceRecordsNoMapFilter: ${allResultsOccurrenceRecordsNoMapFilter},
        pageResultsOccurrenceRecords:           ${pageResultsOccurrenceRecords},
        pageResultsOccurrencePresenceRecords:   ${pageResultsOccurrencePresenceRecords},
        pageResultsOccurrenceAbsenceRecords:    ${pageResultsOccurrenceAbsenceRecords},
        defaultDecimalLatitude:     ${grailsApplication.config.map?.default?.decimalLatitude},
        defaultDecimalLongitude:    ${grailsApplication.config.map?.default?.decimalLongitude},
        defaultZoomLevel:           ${grailsApplication.config.map?.default?.zoomLevel},
        mapAttribution:             "${raw(grailsApplication.config.skin.orgNameLong)}",
        defaultMapUrl:              "${grailsApplication.config.map.default.url}",
        defaultMapBaselayer:        "${grailsApplication.config.map.default?.baselayer?: 'Minimal'}",
        defaultMapAttr:             "${raw(grailsApplication.config.map.default.attr)}",
        defaultMapId:               "${grailsApplication.config.map.default.id}",
        defaultMapToken:            "${grailsApplication.config.map.default.token}",
        mapQueryContext:            "${grailsApplication.config?.biocacheService?.queryContext ?: ''}",
        additionalMapFilter:        "${raw(grailsApplication.config.show?.additionalMapFilter ?: '')}",
        map:                        null,
        mapOutline:                 ${grailsApplication.config.map.outline ?: 'false'},
        mapEnvOptions:              "${grailsApplication.config.map.env?.options?:'color:' + (grailsApplication.config.map?.records?.colour?: 'e6704c')+ ';name:circle;size:4;opacity:0.8'}",
        mapEnvLegendTitle:          "${grailsApplication.config.map.env?.legendtitle?:''}",
        mapEnvLegendHideMax:        "${grailsApplication.config.map.env?.legendhidemaxrange?:false}",
        mapLayersFqs:               "${grailsApplication.config.map.layers?.fqs?:''}",
        mapLayersLabels:            "${grailsApplication.config.map.layers?.labels?:''}",
        mapLayersColours:           "${grailsApplication.config.map.layers?.colours?:''}",
        spatialWmsUrl:              "${grailsApplication.config.geoserver?.baseURL?:''}",
        showResultsMap:             ${grailsApplication.config?.show?.mapResults == 'true'},
        mapPresenceAndAbsence:      ${grailsApplication.config?.show?.mapPresenceAndAbsence == 'true'},
        resultsToMap:               "${(grailsApplication.config?.show?.mapPresenceAndAbsence == 'true') ? searchResultsPresence : searchResults}",
        resultsToMapJSON:           null,
        presenceOrAbsence:          "${(grailsApplication.config?.show?.mapPresenceAndAbsence == 'true') ? "presence" : ""}",
        guid:                       "${guid}",
        query:                     "?q=" + "${cl}:\"${clName}\"",
        queryDisplayString:        "${clName}",
        removeFqs:                 "",
        placeName:          "${placeDetails?.bbg_name_s ?: ''}",
        placeLayers:                null,
        shapeLayers:                null,
        html_MapPAswitch:                "#map-pa-switch",
        html_LegendTable:                "#legendTable",
        html_OccurrenceRecordCountAll:   "#occurrenceRecordCountAll",
        html_OccurrenceRecordCount:      ".occurrenceRecordCount",
        html_LeafletMap:                 "#leafletMap",
        html_ColourByLegendToggle:       "#colour-by-legend-toggle",
        html_ColourByControl:            "#colourByControl",
        html_HideColourControl:          "#hideColourControl",
        html_ColourByTemplate:           "#colourbyTemplate",
};

var MAP_CONF_OVERVIEW = {
        mapType:                    "show",
        cl:                         "${cl}",
        clName:                     "${clName}",
        shape_filter:               "${cl}:\"${clName}\"",
        centroid:                   ${centroid},
        shp_sw:                     ${shp_sw},
        shp_ne:                     ${shp_ne},
        defaultShapeZoom:           ${grailsApplication.config.map?.default?.shapeZoomLevel ?: 10},
        biocacheServiceUrl:         "${grailsApplication.config.biocacheService.baseURL}",
        biocacheUrl:                "${grailsApplication.config.biocache.baseURL}",
        allResultsOccurrenceRecords:            ${allResultsOccurrenceRecords},
        allResultsOccurrenceRecordsNoMapFilter: ${allResultsOccurrenceRecordsNoMapFilter},
        pageResultsOccurrenceRecords:           ${pageResultsOccurrenceRecords},
        pageResultsOccurrencePresenceRecords:   ${pageResultsOccurrencePresenceRecords},
        pageResultsOccurrenceAbsenceRecords:    ${pageResultsOccurrenceAbsenceRecords},
        defaultDecimalLatitude:     ${grailsApplication.config.map?.default?.decimalLatitude},
        defaultDecimalLongitude:    ${grailsApplication.config.map?.default?.decimalLongitude},
        defaultZoomLevel:           ${grailsApplication.config.map?.default?.zoomLevel},
        mapAttribution:             "${raw(grailsApplication.config.skin.orgNameLong)}",
        defaultMapUrl:              "${grailsApplication.config.map.default.url}",
        defaultMapBaselayer:        "${grailsApplication.config.map.default?.baselayer?: 'Minimal'}",
        defaultMapAttr:             "${raw(grailsApplication.config.map.default.attr)}",
        defaultMapId:               "${grailsApplication.config.map.default.id}",
        defaultMapToken:            "${grailsApplication.config.map.default.token}",
        mapQueryContext:            "${grailsApplication.config?.biocacheService?.queryContext ?: ''}",
        additionalMapFilter:        "${raw(grailsApplication.config.show?.additionalMapFilter ?: '')}",
        map:                        null,
        mapOutline:                 ${grailsApplication.config.map.outline ?: 'false'},
        mapEnvOptions:              "${grailsApplication.config.map.env?.options?:'color:' + (grailsApplication.config.map?.records?.colour?: 'e6704c')+ ';name:circle;size:4;opacity:0.8'}",
        mapEnvLegendTitle:          "${grailsApplication.config.map.env?.legendtitle?:''}",
        mapEnvLegendHideMax:        "${grailsApplication.config.map.env?.legendhidemaxrange?:false}",
        mapLayersFqs:               "${grailsApplication.config.map.layers?.fqs?:''}",
        mapLayersLabels:            "${grailsApplication.config.map.layers?.labels?:''}",
        mapLayersColours:           "${grailsApplication.config.map.layers?.colours?:''}",
        spatialWmsUrl:              "${grailsApplication.config.geoserver?.baseURL?:''}",
        showResultsMap:             ${grailsApplication.config?.show?.mapResults == 'true'},
        mapPresenceAndAbsence:      ${grailsApplication.config?.show?.mapPresenceAndAbsence == 'true'},
        resultsToMap:               "${(grailsApplication.config?.show?.mapPresenceAndAbsence == 'true') ? searchResultsPresence : searchResults}",
        resultsToMapJSON:           null,
        presenceOrAbsence:          "${(grailsApplication.config?.show?.mapPresenceAndAbsence == 'true') ? "presence" : ""}",
        guid:                       "${guid}",
        query:                     "?q=" + "${cl}:\"${clName}\"",
        queryDisplayString:        "${clName}",
        removeFqs:                 "",
        placeName:          "${placeDetails?.bbg_name_s ?: ''}",
        placeLayers:                null,
        shapeLayers:                null,
        html_MapPAswitch:                "#map-pa-switch_Overview",
        html_LegendTable:                "#legendTable_Overview",
        html_OccurrenceRecordCountAll:   "#occurrenceRecordCountAll_Overview",
        html_OccurrenceRecordCount:      "#occurrenceRecordCount_Overview",
        html_LeafletMap:                 "#leafletMap_Overview",
        html_ColourByLegendToggle:       "#colour-by-legend-toggle_Overview",
        html_ColourByControl:            "#colourByControl_Overview",
        html_HideColourControl:          "#hideColourControl_Overview",
        html_ColourByTemplate:           "#colourbyTemplate_Overview",
};

$(function(){
    showPlacePage();
    <g:if test="${grailsApplication.config?.show?.mapPresenceAndAbsence == 'true'}">
        initialPresenceAbsenceMap(MAP_CONF_ABOUT, "${searchResultsPresence}", "${searchResultsAbsence}");
        initialPresenceAbsenceMap(MAP_CONF_OVERVIEW, "${searchResultsPresence}", "${searchResultsAbsence}");
    </g:if>
    loadTheMap(MAP_CONF_ABOUT);
    loadTheMap(MAP_CONF_OVERVIEW);
});

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var target = $(e.target).attr("href");
    if(target == "#records") {
        $('#charts').html(''); //prevent multiple loads
        <charts:biocache
            biocacheServiceUrl="${grailsApplication.config.biocacheService.baseURL}"
            biocacheWebappUrl="${grailsApplication.config.biocache.baseURL}"
            q="${shape_filter}"
            qc="${recordsFilterToggle? (recordsFilter ?: '') : (grailsApplication.config.biocacheService.queryContext ?: '')}"
            fq=""/>
    }
    if(target == '#about'){
        loadTheMap(MAP_CONF_ABOUT);
    }
    if (target == '#overview') {
        loadTheMap(MAP_CONF_OVERVIEW);

    }
});

<g:if test="${grailsApplication.config?.show?.mapPresenceAndAbsence == 'true'}">
    setPresenceAbsenceToggle(MAP_CONF_ABOUT, "${searchResultsPresence}", "${searchResultsAbsence}");
    setPresenceAbsenceToggle(MAP_CONF_OVERVIEW, "${searchResultsPresence}", "${searchResultsAbsence}");
</g:if>

$('#submitDownloadMap').click(function(e){
  e.preventDefault();
  downloadMapNow();
});

function downloadMapNow(){
    var bounds = MAP_CONF_ABOUT.map.getBounds();
    var ne =  bounds.getNorthEast();
    var sw =  bounds.getSouthWest();
    var extents = sw.lng + ',' + sw.lat + ',' + ne.lng + ','+ ne.lat;

    var baseMapValue = $('#baseMap').val();
    var baseLayer = "";
    var baseMap = "";
    if (baseMapValue.startsWith("basemap.")){
        baseMap = baseMapValue.substring(8);
    } else if (baseMapValue.startsWith("baselayer.")){
        baseLayer = baseMapValue.substring(10);
    }
    var shapeFilterDecoded = $('<textarea />').html('${shape_filter}').text();
    var downloadUrl =  $('#mapDownloadUrl').val() +
        '?q=' + shapeFilterDecoded +
        '&extents=' + extents +  //need to retrieve the
        '&format=' + $('#format').val() +
        '&dpi=' + $('#dpi').val() +
        '&pradiusmm=' + $('#pradiusmm').val() +
        '&popacity=' + $('#popacity').val() +
        '&pcolour=' + $(':input[name=pcolour]').val().replace('#','').toUpperCase() +
        '&widthmm=' + $('#widthmm').val() +
        '&scale=' + $(':input[name=scale]:checked').val() +
        '&outline=' + $(':input[name=outline]:checked').val() +
        '&outlineColour=0x000000' +
        '&baselayer=' + baseLayer +
        '&baseMap=' + baseMap +
        '&fileName=' + $('#fileName').val()+'.'+$('#format').val().toLowerCase();

    console.log('downloadUrl', downloadUrl);
    $('#downloadMap').modal('hide');
    document.location.href = downloadUrl;
}

</asset:script>

<div class="hide">
    <div class="popupRecordTemplate">
        <div class="multiRecordHeader">
            <g:message code="search.map.viewing" default="Viewing"/> <span class="currentRecord"></span> <g:message code="search.map.of" default="of"/>
            <span class="totalrecords"></span> <g:message code="search.map.occurrences" default="occurrence records"/>
        &nbsp;&nbsp;<i class="glyphicon glyphicon-share-alt"></i> <a href="#" class="btn+btn-xs viewAllRecords"><g:message code="search.map.viewAllRecords" default="view all records"/></a>
        </div>
        <div class="recordSummary">

        </div>
        <div class="multiRecordFooter">
            <span class="previousRecord "><a href="#" class="btn btn-default btn-xs disabled" onClick="return false;"><g:message code="search.map.popup.prev" default="&lt; Prev"/></a></span>
            <span class="nextRecord "><a href="#" class="btn btn-default btn-xs disabled" onClick="return false;"><g:message code="search.map.popup.next" default="Next &gt;"/></a></span>
        </div>
        <div class="recordLink">
            <a href="#" class="btn btn-default btn-xs"><g:message code="search.map.popup.viewRecord" default="View record"/></a>
        </div>
    </div>
</div>

<div id="downloadMap" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="downloadsMapLabel">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <form id="downloadMapForm" class="form-horizontal" role="form">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                    <h3 id="downloadsMapLabel"><g:message code="map.downloadmap.title" default="Download map as image file"/></h3>
                </div>
                <div class="modal-body">
                    <input id="mapDownloadUrl" type="hidden" value="${grailsApplication.config.biocacheService.baseURL}/webportal/wms/image"/>
                    <div class="form-group">
                        <label for="format" class="col-md-5 control-label"><g:message code="map.downloadmap.field01.label" default="Format"/></label>
                        <div class="col-md-6">
                            <select name="format" id="format" class="form-control">
                                <option value="jpg"><g:message code="map.downloadmap.field01.option01" default="JPEG"/></option>
                                <option value="png"><g:message code="map.downloadmap.field01.option02" default="PNG"/></option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="dpi" class="col-md-5 control-label"><g:message code="map.downloadmap.field02.label" default="Quality (DPI)"/></label>
                        <div class="col-md-6">
                            <select name="dpi" id="dpi" class="form-control">
                                <option value="100">100</option>
                                <option value="300" selected="true">300</option>
                                <option value="600">600</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="pradiusmm" class="col-md-5 control-label"><g:message code="map.downloadmap.field03.label" default="Point radius (mm)"/></label>
                        <div class="col-md-6">
                            <select name="pradiusmm" id="pradiusmm" class="form-control">
                                <option>0.1</option>
                                <option>0.2</option>
                                <option>0.3</option>
                                <option>0.4</option>
                                <option>0.5</option>
                                <option>0.6</option>
                                <option selected="true">0.7</option>
                                <option>0.8</option>
                                <option>0.9</option>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                                <option>5</option>
                                <option>6</option>
                                <option>7</option>
                                <option>8</option>
                                <option>9</option>
                                <option>10</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="popacity" class="col-md-5 control-label"><g:message code="map.downloadmap.field04.label" default="Opacity"/></label>
                        <div class="col-md-6">
                            <select name="popacity" id="popacity" class="form-control">
                                <option>1</option>
                                <option>0.9</option>
                                <option>0.8</option>
                                <option selected="true">0.7</option>
                                <option>0.6</option>
                                <option>0.5</option>
                                <option>0.4</option>
                                <option>0.3</option>
                                <option>0.2</option>
                                <option>0.1</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="colourPickerWrapper" class="col-md-5 control-label"><g:message code="map.downloadmap.field05.label" default="Color"/></label>
                        <div class="col-md-6">
                            <input type="color" name="pcolour" id="pcolour" class="form-control" value="#0D00FB">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="widthmm" class="col-md-5 control-label"><g:message code="map.downloadmap.field06.label" default="Width (mm)"/></label>
                        <div class="col-md-6">
                            <input type="text" name="widthmm" id="widthmm" class="form-control" value="150" />
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="scale_on" class="col-md-5 control-label"><g:message code="map.downloadmap.field07.label" default="Include scale"/></label>
                        <div class="col-md-6">
                            <div class="form-control" style="border: none; box-shadow: none;">
                                <input type="radio" name="scale" value="on" id="scale_on" class="form-controlX" checked="checked"/> <g:message code="map.downloadmap.field07.option01" default="Yes"/> &nbsp;
                                <input type="radio" name="scale" value="off" class="form-controlX" /> <g:message code="map.downloadmap.field07.option02" default="No"/>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="outline" class="col-md-5 control-label"><g:message code="map.downloadmap.field08.label" default="Outline points"/></label>
                        <div class="col-md-6">
                            <div class="form-control" style="border: none; box-shadow: none;">
                                <input type="radio" name="outline" value="true" id="outline" class="form-controlX" checked="checked"/> <g:message code="map.downloadmap.field08.option01" default="Yes"/> &nbsp;
                                <input type="radio" name="outline" value="false" class="form-controlX" /> <g:message code="map.downloadmap.field08.option02" default="No"/>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="baseMap" class="col-md-5 control-label"><g:message code="map.downloadmap.field09.label" default="Base layer"/></label>
                        <div class="col-md-6">
                            <select name="baseMap" id="baseMap" class="form-control">
                                <g:each in="${baseMaps}" var="baseMap">
                                    <option value="basemap.${baseMap.name}"><g:message code="${baseMap.i18nCode}" default="${baseMap.displayName}"/></option>
                                </g:each>
                                <g:each in="${baseLayers}" var="baseLayer">
                                    <option value="baselayer.${baseLayer.name}"><g:message code="${baseLayer.i18nCode}" default="${baseLayer.displayName}"/></option>
                                </g:each>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="fileName" class="col-md-5 control-label"><g:message code="map.downloadmap.field10.label" default="File name (without extension)"/></label>
                        <div class="col-md-6">
                            <input type="text" name="fileName" id="fileName" class="form-control" value="MyMap"/>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-default" data-dismiss="modal" aria-hidden="true"><g:message code="map.downloadmap.button02.label" default="Close"/></button>
                    <button id="submitDownloadMap" class="btn btn-primary"><g:message code="map.downloadmap.button01.label" default="Download map"/></button>
                </div>
            </form>
        </div>
    </div>
</div>

</body>
</html>
