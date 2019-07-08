//from biocache-service colorUtil, plus other websafe colours (more than 100, which is current max on records-per-page)
var colours = [/* colorUtil */ "8B0000", "FF0000", "CD5C5C", "E9967A", "8B4513", "D2691E", "F4A460", "FFA500", "006400", "008000", "00FF00", "90EE90", "191970", "0000FF",
    "4682B4", "5F9EA0", "00FFFF", "B0E0E6", "556B2F", "BDB76B", "FFFF00", "FFE4B5", "4B0082", "800080", "FF00FF", "DDA0DD", "000000", "FFFFFF",
    /* websafe */ "CC6699", "660066", "9966CC", "CCCCFF", "0099CC", "993366", "990099", "990033", "00CC66", "0033FF", "999966", "FF0099", "FF6600",
    "CC6633", "66CC99", "CCFFCC", "99CC00", "330000", "660033", "FF3300", "FF0033", "330066", "CC3366", "3300CC", "339966", "FFFF99", "669966",
    "663333", "33FF66", "33FFFF", "999933", "00FFCC", "33CC99", "FF0066", "3366CC", "0033CC", "66CC00", "663399", "993399", "99CC33", "660000",
    "3333CC", "CCFF33", "6633FF", "66FFFF", "00CC99", "003399", "9966FF", "996699", "33FF00", "CC99CC", "FF99CC", "6699FF", "6666CC", "FF9966",
    "003333", "6633CC", "FF33CC", "669933", "FFCC33", "FFCCCC", "33FF33", "CCCC00", "99CCFF", "330099", "FF33FF", "663300", "FFFFCC", "66FF00",
    "339933", "FF00CC", "00CCFF", "CC6666", "66CCFF", "336699", "009933", "33FF99", "009900", "CC3300", "333333", "CC0000", "99CC99", "0066FF",
    "99FFFF", "66FFCC", "FF3333", "CC99FF", "FF9900", "CCCC66", "660099", "FFCC99", "3366FF", "FF6633", "990066", "CC66FF", "00CC33", "00CC00",
    "333300", "009966", "CC0033", "CC3333", "339999", "CC33FF", "CC0066", "FFCC00", "CC00FF", "CCFF66", "9999CC", "00FF66", "666633", "003300",
    "993300", "996633", "993333", "FFCCFF", "000066", "99FF00", "FF6666", "FF9933", "3399FF", "66CC66", "CC9966", "999900", "3333FF", "6600FF",
    "CC00CC", "66FF66", "99FF66", "669900", "6666FF", "990000", "3300FF", "CC33CC", "CCFFFF", "9999FF", "999999", "330033", "CC0099", "000033",
    "339900", "CC9933", "33CC00", "FF3366", "FF3399", "009999", "FFCC66", "333366", "99FF33", "CC6600", "33CCCC", "663366", "336666", "CCFF00",
    "666666", "003366", "0099FF", "336633", "CCCC33", "CC66CC", "66FF33", "336600", "006699", "00CCCC", "000099", "9933FF", "FF6699", "66FF99",
    "9933CC", "FF99FF", "996600", "33FFCC", "66CC33", "006600", "99CCCC", "3399CC", "0066CC", "33CC66", "99FF99", "33CC33", "6699CC", "666699",
    "FF66CC", "CC3399", "9900CC", "CC9900", "CC9999", "669999", "FF66FF", "00FF33", "FFFF33", "CCFF99", "CCCCCC", "66CCCC", "996666", "006633",
    "FFFF66", "9900FF", "00FF99", "333399", "99FFCC", "666600", "33CCFF", "006666", "0000CC", "6600CC", "CCCC99", "FF9999", "99CC66"
];

//supports record counts up to ~170 million (as natural log scale)
var greenColours = [ "CCFFCC", "B3FFB3", "99FF99", "80FF80", "66FF66", "4DFF4D", "33FF33", "1AFF1A", "00FF00", "00E600", "00CC00", "00B300", "009900", "008000", "006600", "004D00", "003300", "001A00" ];

var placeHtmlStyles = "background-color: #[greenColourMatched]; width: 3rem; height: 3rem; display: block; left: -1.5rem; top: -1.5rem; position: relative; border-radius: 3rem 3rem 0; transform: rotate(45deg); border: 1px solid #777;";

L.Icon.Default.imagePath = 'assets/leaflet/images/';

//adapted from sliderProUtils function of same name
function checkIE() {
    if ( typeof checkIE.isIE !== 'undefined' ) {
        return checkIE.isIE;
    }

    var userAgent = window.navigator.userAgent,
        msie = userAgent.indexOf( 'MSIE' );
    if ( userAgent.indexOf( 'MSIE' ) !== -1 || userAgent.match( /Trident.*rv\:11\./ ) ) {
        checkIE.isIE = true;
    } else {
        checkIE.isIE = false;
    }

    return checkIE.isIE;
}

function loadTheMap (MAP_CONF) {
    if (MAP_CONF.showResultsMap) {
        MAP_CONF.resultsToMapJSON = JSON.parse($('<textarea/>').html(MAP_CONF.resultsToMap).text());
        var firstMapShow = true;
        var isIE = checkIE();
        //leaflet maps don't like being loaded in a div that isn't being shown, this fixes the position of the map
        $(function () {
            if (MAP_CONF.mapType == 'search') {
                $("#tabs").tabs({
                    beforeActivate: function (event, ui) {
                        if (firstMapShow) {
                            firstMapShow = false;
                            if (!isIE) {
                                window.dispatchEvent(new Event('resize'));
                            } else {
                                var event = document.createEvent("Event");
                                event.initEvent("resize", false, true);
                                window.dispatchEvent(event);
                            }
                            fitResultsMapToBounds(MAP_CONF);
                        }
                    }
                });
            }
            removeMap(MAP_CONF);
            loadMap(MAP_CONF);
            setMapTitle(MAP_CONF);
            if (!isIE) {
                window.dispatchEvent(new Event('resize'));
            } else {
                var event = document.createEvent("Event");
                event.initEvent("resize", false, true);
                window.dispatchEvent(event);
            }
        });
    }
}

function initialPresenceAbsenceMap(MAP_CONF, searchResultsPresence, searchResultsAbsence) {
    if ($('input[name=toggle]:checked', '#map-pa-switch').val() == 'absence') {
        MAP_CONF.resultsToMap = searchResultsAbsence;
        MAP_CONF.presenceOrAbsence = "absence";
    } //else default is presence map
}

function setPresenceAbsenceToggle(MAP_CONF, searchResultsPresence, searchResultsAbsence) {
    $('input[name=toggle]', '#map-pa-switch').change(function() {
        var toggle = this.value;
        if (toggle == 'absence') {
            MAP_CONF.resultsToMap = searchResultsAbsence;
            MAP_CONF.presenceOrAbsence = "absence";
            removeMap(MAP_CONF);
            loadTheMap(MAP_CONF);

        } else if (toggle == 'presence') {
            MAP_CONF.resultsToMap = searchResultsPresence;
            MAP_CONF.presenceOrAbsence = "presence";
            removeMap(MAP_CONF);
            loadTheMap(MAP_CONF);
        }
    });
}

function removeMap(MAP_CONF) {
    if (MAP_CONF.map) {
        MAP_CONF.map.remove();
        MAP_CONF.map.off();
        delete MAP_CONF.map;
    }
}


var clickCount = 0;

/**
 * Fudge to allow double clicks to propagate to map while allowing single clicks to be registered
 *
 */
function pointLookupClickRegister(e) {
    clickCount += 1;
    if (clickCount <= 1) {
        setTimeout(function() {
            if (clickCount <= 1) {
                pointLookup(e);
            }
            clickCount = 0;
        }, 400);
    }
}

function addLegendItem(name, red, green, blue, rgbhex, hiderangemax){
    var isoDateRegEx = /^(\d{4})-\d{2}-\d{2}T.*/; // e.g. 2001-02-31T12:00:00Z with year capture

    if (name.search(isoDateRegEx) > -1) {
        // convert full ISO date to YYYY-MM-DD format
        name = name.replace(isoDateRegEx, "$1");
    }
    var startOfRange = name.indexOf(":[");
    if (startOfRange != -1) {
        var nameVal = name.substring(startOfRange+1).replace("["," ").replace("]"," ").replace(" TO "," to ").trim();
        if (hiderangemax) nameVal = nameVal.split(' to ')[0];
    } else {
        var nameVal = name;
    }
    var legendText = (nameVal);

    $(".legendTable")
        .append($('<tr>')
            .append($('<td>')
                .append($('<i>')
                    .addClass('legendColour')
                    .attr('style', "background-color:" + (rgbhex!=''? "#" + rgbhex : "rgb("+ red +","+ green +","+ blue + ")") + ";")
                )
                .append($('<span>')
                    .addClass('legendItemName')
                    .html(legendText)
                )
            )
        );
}

function setMapTitle (MAP_CONF) {
    if (MAP_CONF.mapType == 'show') {
        //added checks for >= 0 because if -1 then webservice call timed out
        if (MAP_CONF.pageResultsOccurrenceRecords >= 0) {
            $('#occurrenceRecordCountAll').html("(" + MAP_CONF.pageResultsOccurrenceRecords.toLocaleString() + " in total)");
        }

        if (MAP_CONF.pageResultsOccurrenceRecords >= 0) {
            $(".occurrenceRecordCount").html(MAP_CONF.pageResultsOccurrenceRecords.toLocaleString()); //place show charts tab
        }
        if (MAP_CONF.presenceOrAbsence == 'presence') {
            if (MAP_CONF.pageResultsOccurrencePresenceRecords >= 0) {
                $('#occurrenceRecordCount').html(MAP_CONF.pageResultsOccurrencePresenceRecords.toLocaleString() + " presence");
            }
        } else if (MAP_CONF.presenceOrAbsence == 'absence') {
            if (MAP_CONF.pageResultsOccurrenceAbsenceRecords >= 0) {
                $('#occurrenceRecordCount').html(MAP_CONF.pageResultsOccurrenceAbsenceRecords.toLocaleString() + " absence");
            }
        } else { //all records
            if (MAP_CONF.pageResultsOccurrenceRecords >= 0) {
                $('#occurrenceRecordCount').html(MAP_CONF.pageResultsOccurrenceRecords.toLocaleString() + "");
            }
            if (MAP_CONF.allResultsOccurrenceRecordsNoMapFilter >= 0) {
                $('#occurrenceRecordCountAll').html("(" + MAP_CONF.allResultsOccurrenceRecordsNoMapFilter.toLocaleString() + " in total)");
            }
        }
    }
}

function extractCoordsFromWKTPoint(wkt) {
    //TODO this is very hacky WKT extraction
    return wkt.substring("POINT(".length, wkt.length - 1).split(" ")
}

var placeLayers = new L.LayerGroup();
var shapeLayers = new L.LayerGroup();

function fitResultsMapToBounds(MAP_CONF) {
    var lat_min = null, lat_max = null, lon_min = null, lon_max = null;
    var changed = false;

    for (var i = 0; i < MAP_CONF.resultsToMapJSON.results.length; i++) {
        var place = MAP_CONF.resultsToMapJSON.results[i];
        var feature = extractCoordsFromWKTPoint(place.centroid);
        if (lat_min === null || lat_min > feature[1]) {
            lat_min = feature[1];
            changed = true;
        }
        if (lat_max === null || lat_max < feature[1]) {
            lat_max = feature[1];
            changed = true;
        }
        if (lon_min === null || lon_min > feature[0]) {
            lon_min = feature[0];
            changed = true;
        }
        if (lon_max === null || lon_max < feature[0]) {
            lon_max = feature[0];
            changed = true;
        }
    }
    if (changed) {
        if (lon_min == lon_max) {
            lon_min -= 0.00001;
            lon_max += 0.00001;
        }
        if (lat_min == lat_max) {
            lat_min -= 0.00001;
            lat_max += 0.00001;
        }
        var sw = L.latLng(lat_min || 0, lon_min || 0);
        var ne = L.latLng(lat_max || 0, lon_max || 0);

        var dataBounds = L.latLngBounds(sw, ne);

        setTimeout(function() {
            //seem to be running int https://github.com/Leaflet/Leaflet/issues/3249: if map is not in open tab when page first loads
            MAP_CONF.map.fitBounds(dataBounds, {maxZoom: MAP_CONF.defaultShapeZoom, animate: false});
        }, 300);

    }
}

function loadMap(MAP_CONF) {

    placeLayers = new L.LayerGroup();
    shapeLayers = new L.LayerGroup();

    var prms = {
        layers: 'ALA:occurrences',
        format: 'image/png',
        transparent: true,
        attribution: MAP_CONF.mapAttribution,
        bgcolor: "0x000000",
        outline: MAP_CONF.mapOutline
    };

    var mapContextUnencoded = $('<textarea/>').html(MAP_CONF.mapQueryContext).text(); //to convert e.g. &quot; back to "

    if (MAP_CONF.mapType == 'search') {
    //search results: show place centroids

        //console.log("MAP_CONF.resultsToMapJSON.results.length = " + MAP_CONF.resultsToMapJSON.results.length);
        for( var i = 0; i < MAP_CONF.resultsToMapJSON.results.length; i++) {
            var place = MAP_CONF.resultsToMapJSON.results[i];

            if (!place.recordCount) place.recordCount=0; //if not sampled yet

            var placeLink = "<a href='places/" + place.id + "'>" + place.name + "</a>";
            var placeStats = "<br/>Records: " + place.recordCount.toString();
            if (!place.recordCount) placeStats += "<br/>Species: 0";
            var colIndx = Math.floor(Math.log(place.recordCount + 1));
            if (colIndx > greenColours.length-1) colIndx = greenColours.length-1;
            var fillColorScheme = greenColours[colIndx];
            var placeIcon = L.divIcon({
                iconAnchor: [0,24],
                labelAnchor: [-6,0],
                popupAnchor: [0,-36],
                html: '<span style="' + placeHtmlStyles.replace('[greenColourMatched]',fillColorScheme) + '"/>'
            });
            var feature = extractCoordsFromWKTPoint(place.centroid);
            var marker = L.marker([feature[1],feature[0]], {icon: placeIcon});
            marker.properties = {};
            marker.properties.placeGuid = place.id;

            marker
                .addTo(placeLayers)
                .bindPopup(placeLink + placeStats)
                .on('click', function(e) {
                    //console.log(e);
                    if (!(e.target._popup._content.includes("<br/>Species:"))) { //has not been populated with stats
                        var jsonUrl = "place-stats/" + e.target.properties.placeGuid ;
                        $.getJSON(jsonUrl, function(data) {
                            var popup = e.target.getPopup();
                            popup.setContent(e.target._popup._content +
                                "<br/>Species: " + data.speciesCount);
                        });
                    }
                });
        }
    } else if (MAP_CONF.mapType == 'show') {
    //single place map with possible criteria-based or colormode themeing

        var shapeLayer = L.tileLayer.wms(MAP_CONF.spatialWmsUrl + '/ALA/wms?', {
            layers: 'ALA:Objects',
            viewparams: 's:' + MAP_CONF.guid,
            tiled: true,
            format: 'image/png',
            transparent: true,
            outline: true,
            opacity: 0.25,
            styles: 'polygon',
            maxZoom: 18,
            minZoom: 0,
            continuousWorld: true
        }).addTo(shapeLayers);

        if (MAP_CONF.mapLayersFqs != '') { // additional FQ criteria for each map layer
            fqsArr = MAP_CONF.mapLayersFqs.split("|");
            coloursArr = MAP_CONF.mapLayersColours.split("|");
            var prmsLayer = [];
            var placeLayer = [];
            var htmlEntityDecoder = document.createElement('textarea');
            for (i = 0; i < fqsArr.length; i++) {
                prmsLayer[i] = $.extend({}, prms);
                prmsLayer[i]["ENV"] = MAP_CONF.mapEnvOptions + ";color:" + coloursArr[i];
                htmlEntityDecoder.innerHTML = fqsArr[i];

                var shapeFilterDecoded = $('<textarea/>').html(MAP_CONF.shape_filter).text();
                var url = MAP_CONF.biocacheServiceUrl + "/mapping/wms/reflect?q=" + shapeFilterDecoded +
                    "&qc=" + mapContextUnencoded + (MAP_CONF.additionalMapFilter? '&' + MAP_CONF.additionalMapFilter : '') +
                    "&fq=" + htmlEntityDecoder.value;
                if (MAP_CONF.presenceOrAbsence == 'presence') {
                    url += "&fq=occurrence_status:present"
                } else if (MAP_CONF.presenceOrAbsence == 'absence') {
                    url += "&fq=-occurrence_status:present"
                }
                //console.log("Mapping records: " + url);
                placeLayer[i] = L.tileLayer.wms(url, prmsLayer[i]);
                placeLayer[i].addTo(placeLayers);
            }
        } else {
            prms["ENV"] = MAP_CONF.mapEnvOptions;
            var shapeFilterDecoded = $('<textarea/>').html(MAP_CONF.shape_filter).text();
            var url = MAP_CONF.biocacheServiceUrl + "/mapping/wms/reflect?q=" + shapeFilterDecoded +
                "&qc=" + mapContextUnencoded + (MAP_CONF.additionalMapFilter? '&' + MAP_CONF.additionalMapFilter : '');
            if (MAP_CONF.presenceOrAbsence == 'presence') {
                url += "&fq=occurrence_status:present"
            } else if (MAP_CONF.presenceOrAbsence == 'absence') {
                url += "&fq=-occurrence_status:present"
            }
            var placeLayer = L.tileLayer.wms(url, prms);
            placeLayer.addTo(placeLayers);
        }


    }

    var ColourByControl = L.Control.extend({
        options: {
            position: 'topright',
            collapsed: false
        },
        onAdd: function (map) {
            // create the control container with a particular class name
            var $controlToAdd = $('.colourbyTemplate').clone();
            var container = L.DomUtil.create('div', 'leaflet-control-layers');
            var $container = $(container);
            $container.attr("id","colourByControl");
            $container.attr('aria-haspopup', true);
            $container.html($controlToAdd.html());
            return container;
        }
    });


    MAP_CONF.map = L.map('leafletMap', {
        center: [MAP_CONF.defaultDecimalLatitude, MAP_CONF.defaultDecimalLongitude],
        zoom: MAP_CONF.defaultZoomLevel,
        layers: [placeLayers, shapeLayers],
        scrollWheelZoom: false
    });

    var defaultBaseLayer = L.tileLayer(MAP_CONF.defaultMapUrl, {
        attribution: MAP_CONF.mapAttribution,
        subdomains: MAP_CONF.defaultMapDomain,
        mapid: MAP_CONF.defaultMapId,
        token: MAP_CONF.defaultMapToken
    });

    defaultBaseLayer.addTo(MAP_CONF.map);

    var baseLayers = {
        "Minimal" : defaultBaseLayer,
        "Road" :  new L.Google('ROADMAP'),
        "Terrain" : new L.Google('TERRAIN'),
        "Satellite" : new L.Google('HYBRID')
    };

    var overlays = {};

    if (MAP_CONF.mapType == 'search') {

        //console.log("placeLayers:");
        //console.log(placeLayers);
        overlays['places'] = placeLayers;
        L.control.layers(baseLayers, overlays).addTo(MAP_CONF.map);
    } else if (MAP_CONF.mapType == 'show') {
        var placeName = MAP_CONF.placeName;
        overlays[MAP_CONF.clName] = shapeLayer;
        if (MAP_CONF.mapLayersFqs != '') { // additional FQ criteria for each map layer
            labelsArr = MAP_CONF.mapLayersLabels.split("|");
            for (i = 0; i < placeLayer.length; i++) {
                overlays[placeName + ": " + labelsArr[i]] = placeLayer[i];
            }
            L.control.layers(baseLayers, overlays).addTo(MAP_CONF.map);
        } else {
            overlays[placeName] = placeLayer;
            L.control.layers(baseLayers, overlays).addTo(MAP_CONF.map);
        }
    }

    MAP_CONF.map.addControl(new ColourByControl());
    //TODO: fix this
    //L.control.coordinates({position:"bottomright", useLatLngOrder: true}).addTo(MAP_CONF.map); // coordinate plugin

    $('.leaflet-container').css('cursor','pointer'); //override grab and grabbing pointers to indicate that user can click on points; not ideal


    $('.colour-by-control').click(function(e){
        if($(this).parent().hasClass('leaflet-control-layers-expanded')){
            $(this).parent().removeClass('leaflet-control-layers-expanded');
            $('.colour-by-legend-toggle').show();
        } else {
            $(this).parent().addClass('leaflet-control-layers-expanded');
            $('.colour-by-legend-toggle').hide();
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
    });

    $('.colour-by-control').parent().addClass('leaflet-control-layers-expanded');
    $('.colour-by-legend-toggle').hide();

    $('#colourByControl').mouseover(function(e){
        //console.log('mouseover');
        MAP_CONF.map.dragging.disable();
        MAP_CONF.map.off('click', pointLookupClickRegister);
    });

    $('#colourByControl').mouseout(function(e){
        //console.log('mouseout');
        MAP_CONF.map.dragging.enable();
        MAP_CONF.map.on('click', pointLookupClickRegister);
    });

    $('.hideColourControl').click(function(e){
        //console.log('hideColourControl');
        $('#colourByControl').removeClass('leaflet-control-layers-expanded');
        $('.colour-by-legend-toggle').show();
        e.preventDefault();
        e.stopPropagation();
        return false;
    });

    MAP_CONF.map.invalidateSize(false);

    if (MAP_CONF.mapType == 'show') {
        console.log(MAP_CONF);
        if (MAP_CONF.centroid[1] < 91 && MAP_CONF.centroid[0] < 181) { //real values
            var dataBounds = L.latLngBounds(MAP_CONF.shp_sw, MAP_CONF.shp_ne);
            MAP_CONF.map.fitBounds(dataBounds);
            if (MAP_CONF.map.getZoom() > MAP_CONF.defaultShapeZoom) {
                MAP_CONF.map.setZoom(MAP_CONF.defaultShapeZoom);
            }
            MAP_CONF.map.invalidateSize(true);
        }
    }
    MAP_CONF.map.on('click', pointLookupClickRegister);

    if (MAP_CONF.mapType == 'search') {
        fitResultsMapToBounds(MAP_CONF);
    }

    if (MAP_CONF.mapType == 'search') {
        $('.legendTable').html('');
        $('.legendTable')
            .append($('<tr>')
                .append($('<td>')
                    .addClass('legendTitle')
                    .html("Places" + ":")
                )
            );


        addLegendItem("Places", 0, 0, 0, colours[0], false);

    } else if (MAP_CONF.mapType == 'show') {

        if( MAP_CONF.mapEnvOptions.indexOf("colormode:") >= 0 || MAP_CONF.mapLayersLabels != '') {
            var mapOptArr = MAP_CONF.mapEnvOptions.split(";");
            var legendQ = '';
            for (var i = 0; i < mapOptArr.length; i++) {
                if (mapOptArr[i].indexOf('colormode:') == 0) {
                    legendQ = mapOptArr[i].substring('colormode:'.length);
                    break;
                }
            }
            $('.legendTable').html('');
            $(".legendTable")
                .append($('<tr>')
                    .append($('<td>')
                        .addClass('legendTitle')
                        .html(MAP_CONF.mapEnvLegendTitle + ":")
                    )
                );

            if (legendQ != '') {
                var legendUrl = MAP_CONF.biocacheUrl + "/occurrence/legend?q=" + MAP_CONF.shape_filter + "&cm=" + legendQ + "&type=application/json";
                //console.log(legendUrl);
                $.ajax({
                    url: legendUrl,
                    success: function (data) {

                        $.each(data, function (index, legendDef) {
                            var legItemName = legendDef.name ? legendDef.name : 'Not specified';
                            addLegendItem(legItemName, legendDef.red, legendDef.green, legendDef.blue, '', MAP_CONF.mapEnvLegendHideMax);
                        });
                    }
                });
            } else if (MAP_CONF.mapLayersLabels != '') {
                //use predefined legend entries and colours
                var mapLabelsArr = MAP_CONF.mapLayersLabels.split("|");
                var mapColoursArr = MAP_CONF.mapLayersColours.split("|");
                for (var i = 0; i < mapLabelsArr.length; i++) {
                    addLegendItem(mapLabelsArr[i], 0, 0, 0, mapColoursArr[i], false); //use rgbhex and full label provided
                }
            } else {
                $('#colourByControl').hide();
            }
        }
    }
}


/**
 * Event handler for point lookup.
 * @param e
 */
function pointLookup(e) {
    MAP_CONF.popup = L.popup().setLatLng(e.latlng);
    var radius = 0;
    var size = $('sizeslider-val').html();
    var zoomLevel = MAP_CONF.map.getZoom();
    switch (zoomLevel){
        case 0:
            radius = 800;
            break;
        case 1:
            radius = 400;
            break;
        case 2:
            radius = 200;
            break;
        case 3:
            radius = 100;
            break;
        case 4:
            radius = 50;
            break;
        case 5:
            radius = 25;
            break;
        case 6:
            radius = 20;
            break;
        case 7:
            radius = 7.5;
            break;
        case 8:
            radius = 3;
            break;
        case 9:
            radius = 1.5;
            break;
        case 10:
            radius = .75;
            break;
        case 11:
            radius = .25;
            break;
        case 12:
            radius = .15;
            break;
        case 13:
            radius = .1;
            break;
        case 14:
            radius = .05;
            break;
        case 15:
            radius = .025;
            break;
        case 16:
            radius = .015;
            break;
        case 17:
            radius = 0.0075;
            break;
        case 18:
            radius = 0.004;
            break;
        case 19:
            radius = 0.002;
            break;
        case 20:
            radius = 0.001;
            break;
    }

    if (size >= 5 && size < 8){
        radius = radius * 2;
    }
    if (size >= 8){
        radius = radius * 3;
    }

    MAP_CONF.popupRadius = radius;

    if (!MAP_CONF.query) return;

    var mapQuery = MAP_CONF.query.replace(/&(?:lat|lon|radius)\=[\-\.0-9]+/g, ''); // remove existing lat/lon/radius/wkt params
    MAP_CONF.map.spin(true);


    $.ajax({
        url: MAP_CONF.biocacheServiceUrl + "/occurrences/info" + mapQuery + (MAP_CONF.mapQueryContext > ''? '&fq=(' + encodeURIComponent(MAP_CONF.mapQueryContext) +')' : ''),
        jsonp: "callback",
        dataType: "jsonp",
        timeout: 30000,
        data: {
            zoom: MAP_CONF.map.getZoom(),
            lat: e.latlng.wrap().lat,
            lon: e.latlng.wrap().lng,
            radius: radius,
            format: "json"
        },
        success: function (response) {
            MAP_CONF.map.spin(false);

            if (response.occurrences && response.occurrences.length > 0) {

                MAP_CONF.recordList = response.occurrences; // store the list of record uuids
                MAP_CONF.popupLatlng = e.latlng.wrap(); // store the coordinates of the mouse click for the popup

                // Load the first record details into popup
                insertRecordInfo(0);
            }
        },
        error: function (x, t, m) {
            MAP_CONF.map.spin(false);
        },

    });

}

/**
 * Populate the map popup with record details
 *
 * @param recordIndex
 */
function insertRecordInfo(recordIndex) {
    //console.log("insertRecordInfo", recordIndex, MAP_CONF.recordList);
    var recordUuid = MAP_CONF.recordList[recordIndex];
    var $popupClone = $('.popupRecordTemplate').clone();
    MAP_CONF.map.spin(true);

    if (MAP_CONF.recordList.length > 1) {
        // populate popup header
        $popupClone.find('.multiRecordHeader').show();
        $popupClone.find('.currentRecord').html(recordIndex + 1);
        $popupClone.find('.totalrecords').html(MAP_CONF.recordList.length.toString().replace(/100/, '100+'));
        var occLookup = "&radius=" + MAP_CONF.popupRadius + "&lat=" + MAP_CONF.popupLatlng.lat + "&lon=" + MAP_CONF.popupLatlng.lng;
        $popupClone.find('a.viewAllRecords').attr('href', MAP_CONF.biocacheUrl + "/occurrences/search" + MAP_CONF.query.replace(/&(?:lat|lon|radius)\=[\-\.0-9]+/g, '') + occLookup);
        // populate popup footer
        $popupClone.find('.multiRecordFooter').show();
        if (recordIndex < MAP_CONF.recordList.length - 1) {
            $popupClone.find('.nextRecord a').attr('onClick', 'insertRecordInfo('+(recordIndex + 1)+'); return false;');
            $popupClone.find('.nextRecord a').removeClass('disabled');
        }
        if (recordIndex > 0) {
            $popupClone.find('.previousRecord a').attr('onClick', 'insertRecordInfo('+(recordIndex - 1)+'); return false;');
            $popupClone.find('.previousRecord a').removeClass('disabled');
        }
    }

    $popupClone.find('.recordLink a').attr('href', MAP_CONF.biocacheUrl + "/occurrences/" + recordUuid);

    // Get the current record details
    $.ajax({
        url: MAP_CONF.biocacheServiceUrl + "/occurrences/" + recordUuid + ".json",
        jsonp: "callback",
        dataType: "jsonp",
        success: function(record) {
            MAP_CONF.map.spin(false);

            if (record.raw) {
                var displayHtml = formatPopupHtml(record);
                $popupClone.find('.recordSummary').html( displayHtml ); // insert into clone
            } else {
                // missing record - disable "view record" button and display message
                $popupClone.find('.recordLink a').attr('disabled', true).attr('href','javascript: void(0)');
                $popupClone.find('.recordSummary').html( "<br>Error: record not found for ID: <span style='white-space:nowrap;'>" + recordUuid + '</span><br><br>' ); // insert into clone
            }

            MAP_CONF.popup.setContent($popupClone.html()); // push HTML into popup content
            MAP_CONF.popup.openOn(MAP_CONF.map);
        },
        error: function() {
            MAP_CONF.map.spin(false);
        }
    });

}

function formatPopupHtml(record) {
    var displayHtml = "";

    // catalogNumber
    if(record.raw.occurrence.catalogNumber != null){
        displayHtml += "Catalogue number: " + record.raw.occurrence.catalogNumber + '<br />';
    } else if(record.processed.occurrence.catalogNumber != null){
        displayHtml += "Catalogue number: " + record.processed.occurrence.catalogNumber + '<br />';
    }

    // record or field number
    if(record.raw.occurrence.recordNumber != null){
        displayHtml += "Collecting number: " + record.raw.occurrence.recordNumber + '<br />';
    } else if(record.raw.occurrence.fieldNumber != null){
        displayHtml += "Collecting number: " + record.raw.occurrence.fieldNumber + '<br />';
    }


    if(record.raw.classification.vernacularName!=null ){
        displayHtml += record.raw.classification.vernacularName + '<br />';
    } else if(record.processed.classification.vernacularName!=null){
        displayHtml += record.processed.classification.vernacularName + '<br />';
    }

    if (record.processed.classification.scientificName) {
        displayHtml += formatSciName(record.processed.classification.scientificName, record.processed.classification.taxonRankID)  + '<br />';
    } else {
        displayHtml += record.raw.classification.scientificName  + '<br />';
    }

    if(record.processed.attribution.institutionName != null){
        displayHtml += "Institution: " + record.processed.attribution.institutionName + '<br />';
    } else if(record.processed.attribution.dataResourceName != null){
        displayHtml += "Data Resource: " + record.processed.attribution.dataResourceName + '<br />';
    }

    if(record.processed.attribution.collectionName != null){
        displayHtml += "Collection: " + record.processed.attribution.collectionName  + '<br />';
    }

    if(record.raw.occurrence.recordedBy != null){
        displayHtml += "Collector: " + record.raw.occurrence.recordedBy + '<br />';
    } else if(record.processed.occurrence.recordedBy != null){
        displayHtml += "Collector: " + record.processed.occurrence.recordedBy + '<br />';
    }

    if(record.processed.event.eventDate != null){
        //displayHtml += "<br/>";
        var label = "Event date: ";
        displayHtml += label + record.processed.event.eventDate;
    }

    return displayHtml;
}


/**
 * Format the display of a scientific name.
 * E.g. genus and below should be italicised
 */
function formatSciName(name, rankId) {
    var output = "";
    if (rankId && rankId >= 6000) {
        output = "<i>" + name + "</i>";
    } else {
        output = name;
    }
    return output;
}