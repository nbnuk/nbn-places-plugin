//= require_self

var taxon, taxonGuid, speciesGroup = "ALL_SPECIES";
var points = [], infoWindows = []; //TODO: remove?



$(document).ready(function() {
    // Register events for the species_group column
    $('#taxa-level-0').on("mouseover mouseout", 'tr', function() {
        // mouse hover on groups
        if ( event.type == "mouseover" ) {
            $(this).addClass('hoverRow');
        } else {
            $(this).removeClass('hoverRow');
        }
    }).on("click", "tbody", function(e) {
        // catch the link on the taxon groups table
        e.preventDefault(); // ignore the href text - used for data
        groupClicked(e.target);
    });

    // By default action on page load - show the all species group (simulate a click)
    //loadGroups(); //only needed if not triggered on tab click, and the tab is already open


    // QTip tooltips
    $(".tooltips").qtip({
        style: {
            classes: 'ui-tooltip-rounded ui-tooltip-shadow'
        },
        position: {
            target: 'mouse',
            adjust: { x: 6, y: 14 }
        }
    });

    // Handle back button and saved URLs
    // hash coding: #lat|lng|zoom
    var hash = window.location.hash.replace( /^#/, '');
    var hash2;
    var defaultParam = $.url().param('default'); // requires JS import: purl.js
    //console.log("defaultParam", defaultParam);

    if (hash.indexOf("%7C") != -1) {
        // already escaped
        hash2 = hash;
    } else {
        // escape used to prevent injection attacks
        hash2 = encodeURIComponent(hash);
    }

    if (defaultParam) {
        initialize();
    } else if (hash2) {
        //console.log("url hash", hash2);
        var hashParts = hash2.split("%7C"); // note escaped version of |
        if (hashParts.length == 3) {
            bookmarkedSearch(null);
        } else if (hashParts.length == 4) {
            bookmarkedSearch(hashParts[3]);
        } else {
            //attemptGeolocation();
        }
    } else {
        //console.log("url not set, geolocating...");
        //attemptGeolocation();
    }


    // catch the link for "View all records"
    $('body').on("click", '#viewAllRecords', function(e) {
        e.preventDefault();
        //var params = "q=taxon_name:*|"+$('#latitude').val()+"|"+$('#longitude').val()+"|"+$('#radius').val();
        //TODO: set cl and value from SHOW_CONF

        //cl192:%22Abbots+Leigh%3A+Holy+Trinity%22
        var params = "q=*:*&fq=" + SHOW_CONF.shape_filter + "&fq=(geospatial_kosher:true AND -occurrence_status:absent)";
        if (speciesGroup != "ALL_SPECIES") {
            params += "&fq=species_group:" + speciesGroup;
        }
        document.location.href = SHOW_CONF.biocacheServiceUrl +'/occurrences/search?' + params;
    });

    // catch the link for "Download"
    // ?searchParams=${sr?.urlParameters?.encodeAsURL()}&targetUri=${(request.forwardURI)}&totalRecords=${sr.totalRecords}
    $('body').on("click", '#downloadData', function(e) {
        e.preventDefault();
        //var params = "q=taxon_name:*|"+$('#latitude').val()+"|"+$('#longitude').val()+"|"+$('#radius').val();
        var params = "?q=*:*&fq=" + SHOW_CONFIG.shape_filter + "&fq=(geospatial_kosher:true AND -occurrence_status:absent)";
        if (speciesGroup != "ALL_SPECIES") {
            params += "&fq=species_group:" + speciesGroup;
        }
        var searchParams = encodeURIComponent(params);
        document.location.href = SHOW_CONF.biocacheUrl +'/download?searchParams=' + searchParams + "&targetUri=" + 'EYA_CONF.forwardURI'; //TODO
    });


    $("#left-col a").qtip({
        style: {
            classes: 'ui-tooltip-rounded ui-tooltip-shadow'
        },
        position: {
            target: 'mouse',
            adjust: {
                x: 10,
                y: 12
            }
        }
    });

}); // end onLoad event


// pointer fn
function initialize() {
    loadGroups();
}




/**
 * Load (reload) geoJSON data into vector layer
 */
function loadRecordsLayer(retry) {
    //console.log('loadRecordsLayer');
    if (MAP_CONF_OVERVIEW.map) {
        //console.log("taxon = " + taxon);
        //console.log("taxonGuid = " + taxonGuid);
        //console.log("speciesGroup = " + speciesGroup);
        if (taxonGuid) {
            MAP_CONF_OVERVIEW.taxon_filter = "lsid:" + taxonGuid;
        } else if (speciesGroup != "") {
            if (speciesGroup == "ALL_SPECIES") {
                MAP_CONF_OVERVIEW.taxon_filter = "";
            } else {
                MAP_CONF_OVERVIEW.taxon_filter = "species_group:" + speciesGroup;
            }
        }
        loadTheMap(MAP_CONF_OVERVIEW); //note, does not refresh the resultsToMapJSON data, so zoom is unaffected (will remain at widest scale for all data)
    }
}


/**
 * Species group was clicked
 */
function groupClicked(el) {
    // Change the global var speciesGroup
    //speciesGroup = $(el).find('a.taxonBrowse').attr('id');
    //console.log("groupClicked: el");
    //console.log(el);
    if ($(el).attr('id') ) {
        speciesGroup = $(el).attr('id');
    } else {
        speciesGroup = $(el).find('a.taxonBrowse').attr('id');
    }
    //console.log("groupClicked = " + speciesGroup);
    taxon = null; // clear any species click
    taxonGuid = null;
    //taxa = []; // array of taxa
    //taxa = (taxon.indexOf("|") > 0) ? taxon.split("|") : taxon;
    $('#taxa-level-0 tr').removeClass("activeRow");
    $(el).closest('tr').addClass("activeRow");
    $('#taxa-level-1 tbody tr').addClass("activeRow");
    // update records page link text
    if (speciesGroup == "ALL_SPECIES") {
        $("#recordsGroupText").text("all");
    } else {
        $("#recordsGroupText").text("selected");
    }
    // load records layer on map


    // update links to downloads and records list
    loadRecordsLayer();

    var uri = SHOW_CONF.biocacheServiceUrl + "/explore/group/"+speciesGroup+".json?";
    var shape_filter_unencoded = decodeURIComponent(SHOW_CONF.shape_filter).replace(/\+/g," ");
    var params = {
        fq: "(" + shape_filter_unencoded + " AND geospatial_kosher:true AND -occurrence_status:absent)",
        qc: SHOW_CONF.biocacheQueryContext,
        pageSize: 50
    };
    //var params = "?latitude=${latitude}&longitude=${longitude}&radius=${radius}&taxa="+taxa+"&rank="+rank;
    //console.log("groupClicked: " + uri);
    //console.log(params);
    $('#taxaDiv').html('[loading...]');
    $.getJSON(uri, params, function(data) {
        // process JSON data from request
        if (data) processSpeciesJsonData(data);
    });
}

/**
 * Process the JSON data from an Species list AJAX request (species in area)
 */
function processSpeciesJsonData(data, appendResults) {
    // clear right list unless we're paging
    if (!appendResults) {
        //$('#loadMoreSpecies').detach();
        $('#rightList tbody').empty();
    }
    // process JSON data
    if (data.length > 0) {
        var lastRow = $('#rightList tbody tr').length;
        var linkTitle = "display on map";
        var infoTitle = "view species page";
        var recsTitle = "view list of records";
        // iterate over list of species from search
        for (i=0;i<data.length;i++) {
            // create new table row
            var count = i + lastRow;
            // add count
            var tr = '<tr><td class="speciesIndex">'+(count+1)+'.</td>';
            // add scientific name
            tr = tr + '<td class="sciName"><a id="' + data[i].guid + '" class="taxonBrowse2" title="'+linkTitle+'" href="'+ // id=taxon_name
                data[i].name+'"><i>'+data[i].name+'</i></a>';
            // add common name
            if (data[i].commonName) {
                tr = tr + ' : ' + data[i].commonName+'';
            }
            // add links to species page and ocurrence search (inside hidden div)
            if(SHOW_CONF.bieUrl) {

                var speciesInfo = '<div class="speciesInfo">';
                if (data[i].guid) {
                    speciesInfo = speciesInfo + '<a class="speciesPageLink" title="' + infoTitle + '" href="' + SHOW_CONF.bieUrl +'/species/' + data[i].guid +
                        '"><img src="' + SHOW_CONF.image_page_white_go + '" alt="species page icon" style="margin-bottom:-3px;" class="no-rounding"/>' +
                        ' species profile</a> | ';
                }
                speciesInfo = speciesInfo + '<a href="' + SHOW_CONF.biocacheUrl + '/occurrences/search?q=taxon_name:%22' + data[i].name +
                    '%22&fq=' + SHOW_CONF.shape_filter.replace(/\"/g,"%22") + '&fq=-occurrence_status:absent" title="' +
                    recsTitle + '"><img src="' + SHOW_CONF.image_database_go + '" ' +
                    'alt="search list icon" style="margin-bottom:-3px;" class="no-rounding"/> list of records</a></div>';
                tr = tr + speciesInfo;
            }
            // add number of records
            tr = tr + '</td><td class="rightCounts">' + data[i].count + ' </td></tr>';
            // write list item to page
            $('#rightList tbody').append(tr);
            //if (console) console.log("tr = "+tr);
        }

        if (data.length == 50) {
            // add load more link
            var newStart = $('#rightList tbody tr').length;
            var sortOrder = $("div#rightList").data("sort") ? $("div#rightList").data("sort") : "index";
            $('#rightList tbody').append('<tr id="loadMoreSpecies"><td>&nbsp;</td><td colspan="2"><a href="'+newStart+
                '" data-sort="'+sortOrder+'">Show more species</a></td></tr>');
        }

    } else if (appendResults) {
        // do nothing
    } else {
        // no spceies were found (either via paging or clicking on taxon group
        var text = '<tr><td></td><td colspan="2">[no species found]</td></tr>';
        $('#rightList tbody').append(text);
    }

    // Register clicks for the list of species links so that map changes
    $('#rightList tbody tr').click(function(e) {
        e.preventDefault(); // ignore the href text - used for data
        //var thisTaxon = $(this).find('a.taxonBrowse2').attr('href'); // absolute URI in IE!
        var thisTaxonA = $(this).find('a.taxonBrowse2').attr('href').split('/');
        var thisTaxon = thisTaxonA[thisTaxonA.length-1].replace(/%20/g, ' ');
        var guid = $(this).find('a.taxonBrowse2').attr('id');
        taxonGuid = guid;
        taxon = thisTaxon; // global var so map can show just this taxon
        //rank = $(this).find('a.taxonBrowse2').attr('id');
        //taxa = []; // array of taxa
        //taxa = (taxon.indexOf("|") > 0) ? taxon.split("|") : taxon;
        //$(this).unbind('click'); // activate links inside this row
        $('#rightList tbody tr').removeClass("activeRow2"); // un-highlight previous current taxon
        // remove previous species info row
        $('#rightList tbody tr#info').detach();
        var info = $(this).find('.speciesInfo').html();
        // copy contents of species into a new (tmp) row
        if (info) {
            $(this).after('<tr id="info"><td><td>'+info+'<td></td></tr>');
        }
        // hide previous selected species info box
        $(this).addClass("activeRow2"); // highlight current taxon
        // show the links for current selected species
        loadRecordsLayer();
    });

    // Register onClick for "load more species" link & sort headers
    $('#loadMoreSpecies a, thead.fixedHeader a').click(function(e) {
            e.preventDefault(); // ignore the href text - used for data
            var thisTaxon = $('#taxa-level-0 tr.activeRow').find('a.taxonBrowse').attr('id');
            //rank = $('#taxa-level-0 tr.activeRow').find('a.taxonBrowse').attr('id');
            taxa = []; // array of taxa
            taxa = (thisTaxon.indexOf("|") > 0) ? thisTaxon.split("|") : thisTaxon;
            var start = $(this).attr('href');
            var sortOrder = $(this).data("sort") ? $(this).data("sort") : "index";
            var sortParam = sortOrder;
            var commonName = false;
            if (sortOrder == "common") {
                commonName = true;
                sortParam = "index";
                //$("a#commonSort").insertBefore("a#speciesSort");
            } else if (sortOrder == "index") {
                //$("a#speciesSort").insertBefore("a#commonSort");
            }
            var append = true;
            if (start == 0) {
                append = false;
                $(".scrollContent").scrollTop(0); // return scroll bar to top of tbody
            }
            $("div#rightList").data("sort", sortOrder); // save it to the DOM
            // AJAX...
            var uri = SHOW_CONF.biocacheServiceUrl + "/explore/group/"+speciesGroup+".json?";
            var shape_filter_unencoded = decodeURIComponent(SHOW_CONF.shape_filter).replace(/\+/g," ");

            //var params = "&lat="+$('#latitude').val()+"&lon="+$('#longitude').val()+"&radius="+$('#radius').val()+"&group="+speciesGroup;
            var params = {
                fq: "(" + shape_filter_unencoded + " AND geospatial_kosher:true AND -occurrence_status:absent)",
                start: start,
                common: commonName,
                sort: sortParam,
                pageSize: 50,
                qc: SHOW_CONF.biocacheQueryContext
            };
            //console.log("explore params", params, append);
            //$('#taxaDiv').html('[loading...]');
            $('#loadMoreSpecies').detach(); // delete it
            $.getJSON(uri, params, function(data) {
                // process JSON data from request
                processSpeciesJsonData(data, append);
            });
        }
    );

    // add hover effect to table cell with scientific names
    $('#rightList tbody tr').hover(
        function() {
            $(this).addClass('hoverCell');
        },
        function() {
            $(this).removeClass('hoverCell');
        }
    );
}

/*
 * Perform normal spatial search for species groups and species counts
 */
function loadGroups() {
    var url = SHOW_CONF.biocacheServiceUrl +"/explore/groups.json?";
    var shape_filter_unencoded = decodeURIComponent(SHOW_CONF.shape_filter).replace(/\+/g," ");
    //console.log("shape_filter = " + SHOW_CONF.shape_filter);
    //console.log("shape_filter_unencoded = " + shape_filter_unencoded);
    var params = {
        fq: "(" + shape_filter_unencoded + " AND geospatial_kosher:true AND -occurrence_status:absent)",
        facets: "species_group",
        qc: SHOW_CONF.biocacheQueryContext
    }
    //console.log("loadGroups: url = " + url);
    //console.log(params);

    $.getJSON(url, params, function(data) {
        if (data) {
            populateSpeciesGroups(data);
        }
    });
}

/*
 * Populate the species group column (via callback from AJAX)
 */
function populateSpeciesGroups(data) {
    if (data.length > 0) {
        $("#taxa-level-0 tbody").empty(); // clear existing values
        $.each(data, function (i, n) {
            addGroupRow(n.name, n.speciesCount, n.level)
        });

        // Dynamically set height of #taxaDiv (to match containing div height)
        var tableHeight = $('#taxa-level-0').height();
        $('.tableContainer').height(tableHeight+2);
        var tbodyHeight = $('#taxa-level-0 tbody').height();
        $('#rightList tbody').height(tbodyHeight);
        $('#taxa-level-0 tbody tr.activeRow').click();
    }

    function addGroupRow(group, count, indent) {
        var label = group;
        if (group == "ALL_SPECIES") label = "AllSpecies";
        var rc = (group == speciesGroup) ? " class='activeRow'" : ""; // highlight active group
        var labelNoSpaces = label.replace(/\s/g, '');
        var h = "<tr"+rc+" title='click to view group on map'><td class='indent"+indent+"'><a href='#' id='"+group+"' class='taxonBrowse' title='click to view group on map'>"+labelNoSpaces.replace(/([A-Z])/g, ' $1').trim()+"</a></td><td>"+count+"</td></tr>";
        $("#taxa-level-0 tbody").append(h);
    }
}

function bookmarkedSearch(group) {
    if (group) speciesGroup = group;

    // load map and groups
    initialize();
}
