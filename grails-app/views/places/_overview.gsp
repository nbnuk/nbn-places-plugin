<section class="tab-pane fade in active" id="overview">
    <div class="row taxon-row">
        <div class="col-md-6">

            <div class="taxon-summary-gallery">
                <div class="main-img hide">
                    <a class="lightbox-img"
                       data-toggle="lightbox"
                       data-gallery="taxon-summary-gallery"
                       data-parent=".taxon-summary-gallery"
                       data-title=""
                       data-footer=""
                       href="">
                        <img class="mainOverviewImage img-responsive" src="">
                    </a>

                    <div class="caption mainOverviewImageInfo"></div>
                </div>

                <div class="thumb-row hide">
                    <div id="overview-thumbs"></div>

                    <div id="more-photo-thumb-link" class="taxon-summary-thumb" style="">
                        <a class="more-photos tab-link" href="#gallery"
                           title="More Photos"><span>+</span></a>
                    </div>
                </div>
            </div>

            <div id="descriptiveContent"></div>

            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title">Ecological summary</h3>
                </div>

                <div class="panel-body">
                    <g:render template="ecology"/>
                </div>
            </div>

            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title">Ancient & Veteran Trees</h3>
                </div>

                <div class="panel-body">
                    <g:render template="trees"/>
                </div>
            </div>

            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title">Bats and Swifts</h3>
                </div>

                <div class="panel-body">
                    <g:render template="avian"/>
                </div>
            </div>

        </div><!-- end col 1 -->

        <div class="col-md-6">
            <g:if test="${grailsApplication.config.show?.mapResults == 'true'}">
            <div class="place-map">
                <h3><span id="occurrenceRecordCount">[counting]</span> records
                    <span id="occurrenceRecordCountAll"></span>
                    <g:if test="${grailsApplication.config?.show?.mapPresenceAndAbsence == 'true'}">
                        <span class="map-pa-container">
                            <div id="map-pa-switch" class="map-pa-switch">
                                <input type="radio" class="map-pa-switch-input" name="toggle" value="presence" id="map-pa-presence" checked>
                                <label for="map-pa-presence" class="map-pa-switch-label map-pa-switch-label-off">Presence</label>
                                <input type="radio" class="map-pa-switch-input" name="toggle" value="absence" id="map-pa-absence">
                                <label for="map-pa-absence" class="map-pa-switch-label map-pa-switch-label-on">Absence</label>
                                <span class="map-pa-switch-selection"></span>
                            </div>
                        </span>
                    </g:if>
                </h3>
                <g:if test="${message(code:'overview.map.button.records.map.subtitle', default:'')}">
                    <p>${g.message(code:'overview.map.button.records.map.subtitle')}</p>
                </g:if>
                <div id="leafletMap"></div>
                <!-- for legend display, if needed -->
                <div id="template" style="display:none">
                    <div class="colourbyTemplate">
                        <a class="colour-by-legend-toggle colour-by-control tooltips" href="#" title="Map legend - click to expand"><i class="fa fa-list-ul fa-lg" style="color:#333"></i></a>
                        <form class="leaflet-control-layers-list">
                            <div class="leaflet-control-layers-overlays">
                                <div style="overflow:auto;max-height:400px;">
                                    <a href="#" class="hideColourControl pull-right" style="padding-left:10px;"><i class="glyphicon glyphicon-remove" style="color:#333"></i></a>
                                    <table class="legendTable"></table>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <g:if test="${grailsApplication.config.spatial.baseURL}">
                    <g:set var="mapUrl">${grailsApplication.config.spatial.baseURL}?q=${shape_filter}</g:set>
                </g:if>
                <g:else>
                    <g:set var="mapUrl">${biocacheUrl}/occurrences/search?q=${shape_filter}#tab_mapView</g:set>
                </g:else>

                <div class="map-buttons">
                    <a class="btn btn-primary btn-lg"
                       href="${mapUrl}${recordsFilterToggle? "&fq="+recordsFilter : ""}"
                       title="${g.message(code:'overview.map.button.records.map.title', default:'View interactive map')}"
                       role="button"><g:message code="overview.map.button.records.map" default="View Interactive Map"/></a>
                    <g:if test="${grailsApplication.config.map.simpleMapButton.toBoolean()}">
                        <a class="btn btn-primary btn-lg"
                           href='${biocacheUrl}/occurrences/search?q=${shape_filter}${recordsFilterToggle? "&fq="+recordsFilter : ""}#tab_mapView'
                           title="${g.message(code:'overview.map.button.records.simplemap.title', default:'View map')}"
                           role="button"><g:message code="overview.map.button.records.simplemap" default="View map"/></a>
                    </g:if>
                    <a class="btn btn-primary btn-lg"
                       href='${biocacheUrl}/occurrences/search?q=${shape_filter}${recordsFilterToggle? "&fq="+recordsFilter : ""}'
                       title="${g.message(code:'overview.map.button.records.list', default:'View records')}"
                       role="button" target="_new"><g:message code="overview.map.button.records.list" default="View records"/></a>
                    <a class="btn btn-primary btn-lg"
                        href='#downloadMap'
                        title="${g.message(code:'overview.map.button.download', default:'Download map')}"
                        role="button" data-toggle="modal"><g:message code="overview.map.button.download" default="Download map"/></a>
                </div>

            </div>
            </g:if>

            <div class="panel panel-default"> <!-- panel-actions -->
                <div class="panel-body">
                    <ul class="list-unstyled" style="margin-bottom:0">
                        <li><a id="alertsButton" href="#"><span
                                class="glyphicon glyphicon-bell" style="color:#777;top:3px;left:0"></span> Receive alerts when new records are added
                        </a></li>
                    </ul>
                </div>
            </div>

            <div class="panel panel-default panel-data-providers">
                <div class="panel-heading">
                    <h3 class="panel-title">Datasets</h3>
                </div>

                <div class="panel-body">
                    <p><strong><span class="datasetCount"></span>
                    </strong> <span class="datasetLabel">datasets have</span> provided data to the ${grailsApplication.config.skin.orgNameShort} for this place.
                    </p>

                    <p><a class="tab-link"
                          href="#data-partners">Browse the list of datasets</a> and find organisations you can join if you are
                    interested in participating in a survey for this place.
                    </p>
                </div>
            </div>

            <div class="panel panel-default "> <!-- panel-resources -->
                <div class="panel-heading">
                    <h3 class="panel-title">Other Heritage Information</h3>
                </div>

                <div class="panel-body">
                    <g:render template="onlineResources"/>
                </div>
            </div>

            <div id="listContent">
            </div>
        </div><!-- end col 2 -->
    </div>
</section>
