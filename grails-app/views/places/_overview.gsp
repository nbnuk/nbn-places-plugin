<section class="tab-pane fade in active" id="overview">
    <div class="row taxon-row">
        <div class="col-md-6">

            Taxon tree here

        </div><!-- end col 1 -->

        <div class="col-md-6">

            <div class="place-map">
                <h3><span id="occurrenceRecordCount_Overview">[counting]</span> records
                    <span id="occurrenceRecordCountAll_Overview"></span>
                    <g:if test="${grailsApplication.config?.show?.mapPresenceAndAbsence == 'true'}">
                        <span class="map-pa-container">
                            <div id="map-pa-switch_Overview" class="map-pa-switch">
                                <input type="radio" class="map-pa-switch-input" name="toggle" value="presence"
                                       id="map-pa-presence_Overview" checked>
                                <label for="map-pa-presence_Overview"
                                       class="map-pa-switch-label map-pa-switch-label-off">Presence</label>
                                <input type="radio" class="map-pa-switch-input" name="toggle" value="absence"
                                       id="map-pa-absence_Overview">
                                <label for="map-pa-absence_Overview"
                                       class="map-pa-switch-label map-pa-switch-label-on">Absence</label>
                                <span class="map-pa-switch-selection"></span>
                            </div>
                        </span>
                    </g:if>
                </h3>
                <g:if test="${message(code: 'overview.map.button.records.map.subtitle', default: '')}">
                    <p>${g.message(code: 'overview.map.button.records.map.subtitle')}</p>
                </g:if>
                <div id="leafletMap_Overview"></div>
                <!-- for legend display, if needed -->
                <div id="template_Overview" style="display:none">
                    <div class="colourbyTemplate" id="colourbyTemplate_Overview">
                        <a class="colour-by-legend-toggle colour-by-control tooltips" href="#" id="colour-by-legend-toggle_Overview"
                           title="Map legend - click to expand"><i class="fa fa-list-ul fa-lg" style="color:#333"></i>
                        </a>

                        <form class="leaflet-control-layers-list">
                            <div class="leaflet-control-layers-overlays">
                                <div style="overflow:auto;max-height:400px;">
                                    <a href="#" class="hideColourControl pull-right" id="hideColourControl_Overview" style="padding-left:10px;"><i
                                            class="glyphicon glyphicon-remove" style="color:#333"></i></a>
                                    <table class="legendTable" id="legendTable_Overview"></table>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        </div><!-- end col 2 -->
    </div>
</section>
