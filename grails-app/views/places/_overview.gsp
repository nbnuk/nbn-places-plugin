<section class="tab-pane fade in active" id="overview">
    <div class="row taxon-row">
        <div class="col-md-7 col-xs-12">
            <div id="taxaBox">
                <div id="leftList">
                    <table id="taxa-level-0">
                        <thead>
                        <tr>
                            <th><g:message code="eya.table.01.th01" default="Group"/></th>
                            <th><g:message code="eya.table.01.th02" default="Species"/></th>
                        </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
                <div id="rightList" class="tableContainer">
                    <table>
                        <thead class="fixedHeader">
                        <tr>
                            <th class="speciesIndex">&nbsp;&nbsp;</th>
                            <th class="sciName"><a href="0" id="speciesSort" data-sort="taxa" title="sort by taxa"><g:message code="eya.table.02.th01" default="Species"/></a>
                                <span id="sortSeparator">:</span>
                                <a href="0" id="commonSort" data-sort="common" title="sort by common name"><g:message code="eya.table.02.th01.a" default="Common Name"/></a></th>
                            <th class="rightCounts"><a href="0" data-sort="count" title="sort by record count"><g:message code="eya.table.02.th02" default="Records"/></a></th>
                        </tr>
                        </thead>
                        <tbody class="scrollContent">
                        </tbody>
                    </table>
                </div>
            </div>
        </div><!-- .col-md-7 -->
        <div class="col-md-5 col-xs-12">

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
