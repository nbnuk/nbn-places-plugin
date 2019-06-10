/*
 * Copyright (C) 2012 Atlas of Living Australia
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
function showSpeciesPage() {

    //console.log("Starting show species page");

    //load content
    loadOverviewImages();
    loadGalleries();
    loadExpertDistroMap();
    loadExternalSources();
    loadSpeciesLists();
    loadDataProviders();
    loadIndigenousData();
    //
    ////setup controls
    addAlerts();
    // loadBhl(); // now an external link to BHL
    //loadTrove(SHOW_CONF.troveUrl, SHOW_CONF.scientificName,'trove-integration','trove-result-list','previousTrove','nextTrove');

    if (SHOW_CONF.speciesShowNNSSlink == "true") {
        addNNSSlink();
    }
}

//loads list membership and KVP details under 'Datasets' section, and also adds any headline items to subtitle
function loadSpeciesLists(){
    //console.log('### loadSpeciesLists #### ' + SHOW_CONF.speciesListUrl + '/ws/species/' + SHOW_CONF.guid);
    var listHeadlines = SHOW_CONF.speciesAdditionalHeadlinesSpeciesList.split(","); //TODO: what if bad embedded HTML characters? what if key contains comma?
    var addedToHeadline = [];
    $.each(listHeadlines, function (idx, listHeadline) {addedToHeadline[idx] = false;}); //only allow first species list kvp to match a given headline and be included in the headline area
    //console.log(SHOW_CONF.speciesListUrl + '/ws/species/' + SHOW_CONF.guid + '?callback=?');

    $.getJSON(SHOW_CONF.speciesListUrl + '/ws/species/' + SHOW_CONF.guid + '?callback=?', function( data ) {
        if (!data) return;
        var listsDone = [];
        for(var i = 0; i < data.length; i++) {
            var specieslist = data[i];


            var maxListFields = 10;

            if (SHOW_CONF.speciesListLinks > "") {
                addNNSSbiosecurityLinks($('<textarea />').html(SHOW_CONF.speciesListLinks).text(), specieslist);
            }
            if (specieslist.kvpValues.length > 0) {
                $.each(specieslist.kvpValues, function (idx, kvpValue) {
                    //check whether to add to headline for species
                    $.each(listHeadlines, function (idx, listHeadline) {
                        if (specieslist.dataResourceUid + ':' + kvpValue.key == listHeadline && value && !addedToHeadline[idx]) { //for when listHeadline=[dataset]:[key] to show key value for the species list
                            var sppListHeaderHTML = "<h5 class='inline-head'><strong>" + kvpValue.key + ":</strong> ";
                            sppListHeaderHTML += "<span class='species-headline-" + listHeadline + '-' + kvpValue.key + "'>" + value + "</span>";
                            sppListHeaderHTML += "</h5>";
                            $(sppListHeaderHTML).appendTo(".header-inner");
                            addedToHeadline[idx] = true;
                        } else if (specieslist.dataResourceUid == listHeadline && !addedToHeadline[idx]) { //for when listHeadline=[dataset] to simply label membership of species list
                            var sppListHeaderHTML = "<h5 class='inline-head species-headline-" + listHeadline + "'>" + specieslist.list.listName + "</h5>";
                            $(sppListHeaderHTML).appendTo(".header-inner");
                            addedToHeadline[idx] = true;
                        }
                    });
                });
            }

            //add header link to nonnativespecies.org entry if tagged species (INNS specific)
            if (SHOW_CONF.speciesShowNNSSlink == "true") {
                if (SHOW_CONF.tagNNSSlist == specieslist.dataResourceUid) {
                    addNNSSlink(true, specieslist.list.listName);
                }
            }

            if (specieslist.list.isBIE) {
                if (listsDone.indexOf(specieslist.dataResourceUid.toString()) != -1) {
                    continue;
                }
                listsDone.push(specieslist.dataResourceUid);

                var $description = $('#descriptionCollapsibleTemplate').clone();
                $description.css({'display': 'block'});
                $description.attr('id', '#specieslist-block-' + specieslist.dataResourceUid);
                $description.addClass('species-list-block');
                $description.find(".title").html(specieslist.list.listName);
                var $header = $description.find('.showHidePageGroup');
                $header.attr('data-name','specieslist-' + specieslist.dataResourceUid);
                var $details = $description.find('.facetsGroup');
                $details.attr('id','group_specieslist-' + specieslist.dataResourceUid);

                if (specieslist.kvpValues.length > 0) {
                    var content = "<table class='table'>";
                    $.each(specieslist.kvpValues, function (idx, kvpValue) {
                        if (idx >= maxListFields) {
                            return false;
                        }
                        var value = kvpValue.value;
                        if(kvpValue.vocabValue){
                            value = kvpValue.vocabValue;
                        }
                        content += "<tr><td>" + (kvpValue.key + "</td><td>" + value + "</td></tr>");
                    });
                    content += "</table>";
                    $description.find(".content").html(content);
                } else {
                    $description.find(".content").html("A species list provided by " + specieslist.list.listName);
                    $.each(listHeadlines, function (idx, listHeadline) {
                        if (specieslist.dataResourceUid == listHeadline && !addedToHeadline[idx]) { //for when listHeadline=[dataset] to simply label membership of species list
                            var sppListHeaderHTML = "<h5 class='inline-head species-headline-" + listHeadline + "'>" + specieslist.list.listName;
                            sppListHeaderHTML += "</h5>";
                            $(sppListHeaderHTML).appendTo(".header-inner");
                            addedToHeadline[idx] = true;
                        }
                    });
                }

                $description.find(".source").css({'display':'none'});
                $description.find(".rights").css({'display':'none'});

                $description.find(".providedBy").attr('href', SHOW_CONF.speciesListUrl + '/speciesListItem/list/' + specieslist.dataResourceUid);
                $description.find(".providedBy").html(specieslist.list.listName);
                if (specieslist.list.region == SHOW_CONF.nbnRegion) {
                    console.log("equal");
                    var $headerBar = $description.find('.panel-heading');
                    $headerBar.css({'color':'var(--background-color)'});
                    $('#listContent').prepend($description);
                } else {
                    $description.appendTo('#listContent');
                }
            }
        }
    });
}

function addAlerts(){
    // alerts button
    $("#alertsButton").click(function(e) {
        e.preventDefault();
        var query = "Place: " + SHOW_CONF.clName;
        var searchString = '?q=' + SHOW_CONF.cl + ':"' + SHOW_CONF.clName + '"';
        var url = SHOW_CONF.alertsUrl + "/webservice/createBiocacheNewRecordsAlert?";
        url += "queryDisplayName=" + encodeURIComponent(query);
        url += "&baseUrlForWS=" + encodeURIComponent(SHOW_CONF.biocacheServiceUrl);
        url += "&baseUrlForUI=" + encodeURIComponent(SHOW_CONF.serverName);
        url += "&webserviceQuery=%2Foccurrences%2Fsearch" + encodeURIComponent(searchString);
        url += "&uiQuery=%2Foccurrences%2Fsearch%3Fq%3D*%3A*";
        url += "&resourceName=" + encodeURIComponent("Atlas");
        window.location.href = url;
    });
}



function loadDataProviders(){

    var mapShapeFilterUnencoded = $('<textarea />').html(SHOW_CONF.shape_filter).text();
    var url = SHOW_CONF.biocacheServiceUrl  +
        '/occurrences/search.json?q=' + mapShapeFilterUnencoded + /* SHOW_CONF.shape_filter + */
        '&pageSize=0&flimit=-1';

    var mapContextUnencoded = $('<textarea />').html(SHOW_CONF.mapQueryContext).text(); //to convert e.g. &quot; back to "
    if(SHOW_CONF.mapQueryContext){
       url = url + '&fq=' + mapContextUnencoded;
    }
    if (SHOW_CONF.biocacheQueryContext) {
        var bqc_clean = $('<textarea />').html(SHOW_CONF.biocacheQueryContext).text();
        url += "&fq=" + encodeURI(bqc_clean);
    }

    url = url + '&facet=on&facets=data_resource_uid&callback=?';

    var uiUrl = SHOW_CONF.biocacheUrl  +
        '/occurrences/search?q=' + mapShapeFilterUnencoded /* SHOW_CONF.shape_filter */;


    $.getJSON(url, function(data){

        if(data.totalRecords > 0) {

            var datasetCount = data.facetResults[0].fieldResult.length;

            //exclude the "Unknown facet value"
            if(data.facetResults[0].fieldResult[datasetCount - 1].label == "Unknown"){
                datasetCount = datasetCount - 1;
            }

            if(datasetCount == 1){
                $('.datasetLabel').html("dataset has");
            }

            $('.datasetCount').html(datasetCount);
            $.each(data.facetResults[0].fieldResult, function (idx, facetValue) {
                //console.log(data.facetResults[0].fieldResult);
                if(facetValue.count > 0){

                    var uid = facetValue.fq.replace(/data_resource_uid:/, '').replace(/[\\"]*/, '').replace(/[\\"]/, '');
                    var dataResourceUrl =  SHOW_CONF.collectoryUrl + "/public/show/" + uid;
                    var tableRow = "<tr><td><a href='" + dataResourceUrl + "'><span class='data-provider-name'>" + facetValue.label + "</span></a>";

                    //console.log(uid);
                    $.getJSON(SHOW_CONF.collectoryUrl + "/ws/dataResource/" + uid, function(collectoryData) {


                        if(collectoryData.provider){
                            tableRow += "<br/><small><a href='" + SHOW_CONF.collectoryUrl + '/public/show/' + uid + "'>" + collectoryData.provider.name + "</a></small>";
                        }
                        tableRow += "</td>";
                        tableRow += "<td>" + collectoryData.licenseType + "</td>";

                        var queryUrl = uiUrl + "&fq=" + facetValue.fq;
                        tableRow += "</td><td><a href='" + queryUrl + "'><span class='record-count'>" + facetValue.count + "</span></a></td>"
                        tableRow += "</tr>";
                        $('#data-providers-list tbody').append(tableRow);
                    });
                }
            });
        } else {
            $('.datasetLabel').html("No datasets have");
        }
    });
}

function loadIndigenousData() {

    if(!SHOW_CONF.profileServiceUrl || SHOW_CONF.profileServiceUrl == ""){
        return;
    }

    var url = SHOW_CONF.profileServiceUrl + "/api/v1/profiles?summary=true&tags=IEK&guids=" + SHOW_CONF.guid;
    $.getJSON(url, function (data) {
        if (data.total > 0) {
            $("#indigenous-info-tab").parent().removeClass("hide");

            $.each(data.profiles, function(index, profile) {
                var panel = $('#indigenous-profile-summary-template').clone();
                panel.removeClass("hide");
                panel.attr("id", profile.id);

                var logo = profile.collection.logo || SHOW_CONF.noImage100Url;
                panel.find(".collection-logo").append("<img src='" + logo + "' alt='" + profile.collection.title + " logo'>");
                panel.find(".collection-logo-caption").append(profile.collection.title);


                panel.find(".profile-name").append(profile.name);
                panel.find(".collection-name").append("(" + profile.collection.title + ")");
                var otherNames = "";
                var summary = "";
                $.each(profile.attributes, function (index, attribute) {
                    if (attribute.name) {
                        otherNames += attribute.text;
                        if (index < profile.attributes.length - 2) {
                            otherNames += ", ";
                        }
                    }
                    if (attribute.summary) {
                        summary = attribute.text;
                    }
                });
                panel.find(".other-names").append(otherNames);
                panel.find(".summary-text").append(summary);
                panel.find(".profile-link").append("<a href='" + profile.url + "' title='Click to view the whole profile' target='_blank'>View the full profile</a>");

                if(profile.thumbnailUrl) {
                    panel.find(".main-image").removeClass("hide");

                    panel.find(".image-embedded").append("<img src='" + profile.thumbnailUrl + "' alt='" + profile.collection.title + " main image'>");
                }

                if(profile.mainVideo) {
                    panel.find(".main-video").removeClass("hide");
                    panel.find(".video-name").append(profile.mainVideo.name);
                    panel.find(".video-attribution").append(profile.mainVideo.attribution);
                    panel.find(".video-license").append(profile.mainVideo.license);
                    panel.find(".video-embedded").append(profile.mainVideo.embeddedVideo);
                }

                if(profile.mainAudio) {
                    panel.find(".main-audio").removeClass("hide");
                    panel.find(".audio-name").append(profile.mainAudio.name);
                    panel.find(".audio-attribution").append(profile.mainAudio.attribution);
                    panel.find(".audio-license").append(profile.mainAudio.license);
                    panel.find(".audio-embedded").append(profile.mainAudio.embeddedAudio);
                }

                panel.appendTo("#indigenous-info");
            });
        }
    });
}

function loadExternalSources(){
    //load EOL content
    //console.log('####### Loading EOL content - ' + SHOW_CONF.eolUrl);
}

/**
 * Trigger loading of the 3 gallery sections
 */
function loadGalleries() {
    //console.log('loading galleries');
    $('#gallerySpinner').show();
    loadGalleryType('type', 0)
    loadGalleryType('specimen', 0)
    loadGalleryType('other', 0)
    loadGalleryType('uncertain',0)
}

var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
};

function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
    });
}

/**
 * Load overview images on the species page. This is separate from the main galleries.
 */
function loadOverviewImages(){
    var hasPreferredImage = false; // Could get a race condition where no main image gets loaded due callbacks

    if (SHOW_CONF.preferredImageId) {
        hasPreferredImage = true;
        var prefUrl = SHOW_CONF.biocacheServiceUrl  +
            '/occurrences/search.json?q=image_url:' + SHOW_CONF.preferredImageId +
            '&fq=-assertion_user_id:*&im=true&facet=off&pageSize=1&start=0&callback=?';
        $.getJSON(prefUrl, function(data){
            //console.log("prefUrl", prefUrl, data);
            if (data && data.totalRecords > 0) {
                addOverviewImage(data.occurrences[0]);
                hasPreferredImage = true;
            } else {
                hasPreferredImage = false;
            }

        }).fail(function(jqxhr, textStatus, error) {
            alert('Error loading overview image: ' + textStatus + ', ' + error);
            hasPreferredImage = false;
        });
    }

    var mapShapeFilterUnencoded = $('<textarea />').html(SHOW_CONF.shape_filter).text();
    var url = SHOW_CONF.biocacheServiceUrl  +
        '/occurrences/search.json?q=' +
        mapShapeFilterUnencoded + /* 'Amanita' + */
        '&fq=multimedia:Image&fq=-assertion_user_id:*&im=true&facet=off&pageSize=5&start=0&callback=?';
    //console.log('Loading images from: ' + url);

    $.getJSON(url, function(data){
        if (data && data.totalRecords > 0) {
            addOverviewImages(data.occurrences, hasPreferredImage);
        }
    }).fail(function(jqxhr, textStatus, error) {
        alert('Error loading overview images: ' + textStatus + ', ' + error);
    }).always(function() {
        $('#gallerySpinner').hide();
    });
}

function addOverviewImages(imagesArray, hasPreferredImage) {

    if (!hasPreferredImage) {
        // no preferred image so use first in results set
        addOverviewImage(imagesArray[0]);
    }

    for (j = 1; j < 5; j++) {
        // load smaller thumb images
        if(imagesArray.length > j) {
            addOverviewThumb(imagesArray[j], j)
        }
    }
}

function addOverviewImage(overviewImageRecord) {
    $('#noOverviewImages').addClass('hide');
    $('.main-img').removeClass('hide');
    $('.thumb-row').removeClass('hide');
    var $categoryTmpl = $('#overviewImages');
    $categoryTmpl.removeClass('hide');

    var $mainOverviewImage = $('.mainOverviewImage');
    $mainOverviewImage.attr('src',overviewImageRecord.largeImageUrl);
    $mainOverviewImage.parent().attr('href', overviewImageRecord.largeImageUrl);
    $mainOverviewImage.parent().attr('data-title', getImageTitleFromOccurrence(overviewImageRecord));
    $mainOverviewImage.parent().attr('data-footer', getImageFooterFromOccurrence(overviewImageRecord));
    $mainOverviewImage.parent().attr('data-image-id', overviewImageRecord.image);
    $mainOverviewImage.parent().attr('data-record-url', SHOW_CONF.biocacheUrl + '/occurrences/' + overviewImageRecord.uuid);

    $('.mainOverviewImageInfo').html(getImageTitleFromOccurrence(overviewImageRecord));
}

function addOverviewThumb(record, i) {

    if (i < 4) {
        var $thumb = generateOverviewThumb(record, i);
        $('#overview-thumbs').append($thumb);
    } else {
        $('#more-photo-thumb-link').attr('style', 'background-image:url(' + record.smallImageUrl + ')');
    }
}

function generateOverviewThumb(occurrence, id){
    var $taxonSummaryThumb = $('#taxon-summary-thumb-template').clone();
    var $taxonSummaryThumbLink = $taxonSummaryThumb.find('a');
    $taxonSummaryThumb.removeClass('hide');
    $taxonSummaryThumb.attr('id', 'taxon-summary-thumb-'+id);
    $taxonSummaryThumb.attr('style', 'background-image:url(' + occurrence.smallImageUrl + ')');
    $taxonSummaryThumbLink.attr('data-title', getImageTitleFromOccurrence(occurrence));
    $taxonSummaryThumbLink.attr('data-footer', getImageFooterFromOccurrence(occurrence));
    $taxonSummaryThumbLink.attr('href', occurrence.largeImageUrl);
    $taxonSummaryThumbLink.attr('data-image-id', occurrence.image);
    $taxonSummaryThumbLink.attr('data-record-url', SHOW_CONF.biocacheUrl + '/occurrences/' + occurrence.uuid);
    return $taxonSummaryThumb;
}

/**
 * AJAX loading of gallery images from biocache-service
 *
 * @param category
 * @param start
 */
function loadGalleryType(category, start) {

    //console.log("Loading images category: " + category);

    var imageCategoryParams = {
        type: '&fq=type_status:*',
        specimen: '&fq=basis_of_record:PreservedSpecimen&fq=-type_status:*',
        other: '&fq=-type_status:*&fq=-basis_of_record:PreservedSpecimen&fq=-identification_qualifier_s:"Uncertain"&fq=-assertion_user_id:*&sort=identification_qualifier_s&dir=asc',
        uncertain: '&fq=-type_status:*&fq=-basis_of_record:PreservedSpecimen&fq=identification_qualifier_s:"Uncertain"'
    };

    var pageSize = 20;

    if (start > 0) {
        $('.loadMore.' + category + ' button').addClass('disabled');
        $('.loadMore.' + category + ' img').removeClass('hide');
    }

    //TODO a toggle between LSID based searches and names searches
    var mapShapeFilterUnencoded = $('<textarea />').html(SHOW_CONF.shape_filter).text();
    var url = SHOW_CONF.biocacheServiceUrl  +
        '/occurrences/search.json?q=' +
        mapShapeFilterUnencoded + /* 'Amanita' + */
        '&fq=multimedia:"Image"&pageSize=' + pageSize +
        '&facet=off&start=' + start + imageCategoryParams[category] + '&im=true&callback=?';

    //console.log("Gallery URL: " + url);

    $.getJSON(url, function(data){

        //console.log('Total images: ' + data.totalRecords + ", category: " + category);

        if (data && data.totalRecords > 0) {
            var br = "<br>";
            var $categoryTmpl = $('#cat_' + category);
            $categoryTmpl.removeClass('hide');
            $('#cat_nonavailable').addClass('hide');

            $.each(data.occurrences, function(i, el) {
                // clone template div & populate with metadata
                var $taxonThumb = $('#taxon-thumb-template').clone();
                $taxonThumb.removeClass('hide');
                $taxonThumb.attr('id','thumb_' + category + i);
                $taxonThumb.attr('href', el.largeImageUrl);
                $taxonThumb.find('img').attr('src', el.smallImageUrl);
                // turned off 'onerror' below as IE11 hides all images
                //$taxonThumb.find('img').attr('onerror',"$(this).parent().hide();"); // hide broken images

                // brief metadata
                var briefHtml = getImageTitleFromOccurrence(el);
                $taxonThumb.find('.caption-brief').html(briefHtml);
                $taxonThumb.attr('data-title', briefHtml);
                $taxonThumb.find('.caption-detail').html(briefHtml);

                // write to DOM
                $taxonThumb.attr('data-footer', getImageFooterFromOccurrence(el));
                $taxonThumb.attr('data-image-id', el.image);
                $taxonThumb.attr('data-record-url', SHOW_CONF.biocacheUrl + '/occurrences/' + el.uuid);
                $categoryTmpl.find('.taxon-gallery').append($taxonThumb);
            });

            $('.loadMore.' + category).remove(); // remove 'load more images' button that was just clicked

            if (data.totalRecords > (start + pageSize)) {
                // add new 'load more images' button if required
                var spinnerLink = $('img#gallerySpinner').attr('src');
                var btn = '<div class="loadMore ' + category + '"><br><button class="btn btn-default" onCLick="loadGalleryType(\'' + category + '\','
                    + (start + pageSize)  + ');">Load more images <img src="' + spinnerLink + '" class="hide"/></button></div>';
                $categoryTmpl.find('.taxon-gallery').append(btn);
            }
        }
    }).fail(function(jqxhr, textStatus, error) {
        alert('Error loading gallery: ' + textStatus + ', ' + error);
    }).always(function() {
        $('#gallerySpinner').hide();
    });
}

function getImageTitleFromOccurrence(el){
    var br = "<br/>";
    var briefHtml = "";
    //include sci name when genus or higher taxon
    if(SHOW_CONF.taxonRankID  < 7000) {
        briefHtml += (el.raw_scientificName === undefined? el.scientificName : el.raw_scientificName); //raw scientific name can be null, e.g. if taxon GUIDS were submitted
    }

    if (el.typeStatus) {
        if(briefHtml.length > 0)  briefHtml += br;
        briefHtml += el.typeStatus;
    }

    if (el.institutionName) {
        if(briefHtml.length > 0)  briefHtml += br;
        briefHtml += ((el.typeStatus) ? ' | ' : br) + el.institutionName;
    }

    if(el.imageMetadata && el.imageMetadata.length > 0 && el.imageMetadata[0].creator != null){
        if(briefHtml.length > 0)  briefHtml += br;
        briefHtml += "Photographer: " + el.imageMetadata[0].creator;
    } else if(el.imageMetadata && el.imageMetadata.length > 0 && el.imageMetadata[0].rightsHolder != null) {
        if(briefHtml.length > 0)  briefHtml += br;
        briefHtml += "Rights holder: " + el.imageMetadata[0].rightsHolder;
    } else if(el.collector){
        if(briefHtml.length > 0)  briefHtml += br;
        briefHtml += "Supplied by: " + el.collector;
    }

    return briefHtml;
}

function getImageFooterFromOccurrence(el){
    var br = "<br/>";
    var detailHtml = (el.raw_scientificName === undefined? el.scientificName : el.raw_scientificName); //raw scientific name can be null, e.g. if taxon GUIDS were submitted
    if (el.typeStatus) detailHtml += br + 'Type: ' + el.typeStatus;
    if (el.collector) detailHtml += br + 'By: ' + el.collector;
    if (el.eventDate) detailHtml += br + 'Date: ' + moment(el.eventDate).format('YYYY-MM-DD');
    if (el.institutionName && el.institutionName !== undefined) {
        detailHtml += br + "Supplied by: " + el.institutionName;
    } else if (el.dataResourceName && el.dataResourceName !== undefined) {
        detailHtml += br + "Supplied by: " + el.dataResourceName;
    }
    if(el.imageMetadata && el.imageMetadata.length > 0 && el.imageMetadata[0].rightsHolder != null){
        detailHtml += br + "Rights holder: " + el.imageMetadata[0].rightsHolder;
    }

    // write to DOM
    detailHtml += '<div class="recordLink"><a href="' + SHOW_CONF.biocacheUrl + '/occurrences/' + el.uuid + '">View details of this record</a>' +
                  '<br><br>If this image is incorrectly<br>identified please flag an<br>issue on the <a href=' + SHOW_CONF.biocacheUrl +
                  '/occurrences/' + el.uuid + '>record.<br></div>';
    return detailHtml;
}

function loadBhl() {
    loadBhl(0, 10, false);
}

/**
 * BHL search to populate literature tab
 *
 * @param start
 * @param rows
 * @param scroll
 */
function loadBhl(start, rows, scroll) {
    if (!start) {
        start = 0;
    }
    if (!rows) {
        rows = 10;
    }
    // var url = "http://localhost:8080/bhl-ftindex-demo/search/ajaxSearch?q=" + $("#tbSearchTerm").val();
    var source = SHOW_CONF.bhlURL;
    var taxonName = SHOW_CONF.scientificName ;
    var synonyms = SHOW_CONF.synonymsQuery;
    var query = ""; // = taxonName.split(/\s+/).join(" AND ") + synonyms;
    if (taxonName) {
        var terms = taxonName.split(/\s+/).length;
        if (terms > 2) {
            query += taxonName.split(/\s+/).join(" AND ");
        } else if (terms == 2) {
            query += '"' + taxonName + '"';
        } else {
            query += taxonName;
        }
    }

    if (synonyms) {
        synonyms = synonyms.replace(/\\\"/g,'"'); // remove escaped quotes

        if (taxonName) {
            query += ' OR (' + synonyms + ")"
        } else {
            query += synonyms
        }
    }

    if (!query) {
        return cancelSearch("No names were found to search BHL");
    }

    var url = source + "?q=" + query + '&start=' + start + "&rows=" + rows +
        "&wt=json&fl=name%2CpageId%2CitemId%2Cscore&hl=on&hl.fl=text&hl.fragsize=200&" +
        "group=true&group.field=itemId&group.limit=7&group.ngroups=true&taxa=false";

    var buf = "";
    $("#status-box").css("display", "block");
    $("#synonyms").html("").css("display", "none")
    $("#bhl-results-list").html("");

    $.ajax({
        url: url,
        dataType: 'jsonp',
        jsonp: "json.wrf",
        success:  function(data) {
            var itemNumber = parseInt(data.responseHeader.params.start, 10) + 1;
            var maxItems = parseInt(data.grouped.itemId.ngroups, 10);
            if (maxItems == 0) {
                return cancelSearch("No references were found for <pre>" + query + "</pre>");
            }
            var startItem = parseInt(start, 10);
            var pageSize = parseInt(rows, 10);
            var showingFrom = startItem + 1;
            var showingTo = (startItem + pageSize <= maxItems) ? startItem + pageSize : maxItems ;
            buf += '<div class="results-summary">Showing ' + showingFrom + " to " + showingTo + " of " + maxItems +
                ' results for the query <pre>' + query + '</pre></div>'
            // grab highlight text and store in map/hash
            var highlights = {};
            $.each(data.highlighting, function(idx, hl) {
                highlights[idx] = hl.text[0];
            });
            //console.log("highlighting", highlights, itemNumber);
            $.each(data.grouped.itemId.groups, function(idx, obj) {
                buf += '<div class="result">';
                buf += '<h3><b>' + itemNumber++;
                buf += '.</b> <a target="item" href="http://biodiversitylibrary.org/item/' + obj.groupValue + '">' + obj.doclist.docs[0].name + '</a> ';
                var suffix = '';
                if (obj.doclist.numFound > 1) {
                    suffix = 's';
                }
                buf += '(' + obj.doclist.numFound + '</b> matching page' + suffix + ')</h3><div class="thumbnail-container">';

                $.each(obj.doclist.docs, function(idx, page) {
                    var highlightText = $('<div>'+highlights[page.pageId]+'</div>').htmlClean({allowedTags: ["em"]}).html();
                    buf += '<div class="page-thumbnail"><a target="page image" href="http://biodiversitylibrary.org/page/' +
                        page.pageId + '"><img src="http://biodiversitylibrary.org/pagethumb/' + page.pageId +
                        '" alt="' + escapeHtml(highlightText) + '"  width="60px" height="100px"/></a></div>';
                })
                buf += "</div><!--end .thumbnail-container -->";
                buf += "</div>";
            })

            var prevStart = start - rows;
            var nextStart = start + rows;

            buf += '<div id="button-bar">';
            if (prevStart >= 0) {
                buf += '<input type="button" class="btn" value="Previous page" onclick="loadBhl(' + prevStart + ',' + rows + ', true)">';
            }
            buf += '&nbsp;&nbsp;&nbsp;';
            if (nextStart <= maxItems) {
                buf += '<input type="button" class="btn" value="Next page" onclick="loadBhl(' + nextStart + ',' + rows + ', true)">';
            }

            buf += '</div>';

            $("#bhl-results-list").html(buf);
            if (data.synonyms) {
                buf = "<b>Synonyms used:</b>&nbsp;";
                buf += data.synonyms.join(", ");
                $("#synonyms").html(buf).css("display", "block");
            } else {
                $("#synonyms").html("").css("display", "none");
            }
            $("#status-box").css("display", "none");

            if (scroll) {
                $('html, body').animate({scrollTop: '300px'}, 300);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $("#status-box").css("display", "none");
            $("#solr-results").html('An error has occurred, probably due to invalid query syntax');
        }
    });
} // end doSearch

function cancelSearch(msg) {
    $("#status-box").css("display", "none");
    $("#solr-results").html(msg);
    return true;
}

function loadExpertDistroMap() {
    var url = SHOW_CONF.layersServiceUrl + "/distribution/map/" + SHOW_CONF.guid + "?callback=?";
    $.getJSON(url, function(data){
        if (data.available) {
            $("#expertDistroDiv img").attr("src", data.url);
            if (data.dataResourceName && data.dataResourceUrl) {
                var attr = $('<a>').attr('href', data.dataResourceUrl).text(data.dataResourceName)
                $("#expertDistroDiv #dataResource").html(attr);
            }
            $("#expertDistroDiv").show();
        }
    })
}

function expandImageGallery(btn) {
    if(!$(btn).hasClass('.expand-image-gallery')){
        $(btn).parent().find('.collapse-image-gallery').removeClass('btn-primary');
        $(btn).addClass('btn-primary');

        $(btn).parents('.image-section').find('.taxon-gallery').slideDown(400)
    }
}

function collapseImageGallery(btn) {
    if(!$(btn).hasClass('.collapse-image-gallery')){
        $(btn).parent().find('.expand-image-gallery').removeClass('btn-primary');
        $(btn).addClass('btn-primary');

        $(btn).parents('.image-section').find('.taxon-gallery').slideUp(400)
    }
}

function addNNSSlink(inHeader, listName) {
    //opens in new tab. Haven't found a clean way of respecting user instructions on same or new tab opening for a form post
    if (typeof inHeader === 'undefined') { inHeader = false; }
    if (typeof listName === 'undefined') { listName = ''; }
    var NNSSform = "<form style='display:inline' method='post' action='http://www.nonnativespecies.org/factsheet/index.cfm' id='NNSSform" + (inHeader? "_header" : "") + "' target='_blank'>" +
        "<input type='hidden' value='" + (SHOW_CONF.scientificName).replace(/'/g, '') + "' name='query'>" +
        "</form>";
    if (inHeader) {
        NNSSform += "<a id='NNSSform_submit_header' href='#'>" + $('<textarea/>').html(listName).text() + $('<textarea/>').html(SHOW_CONF.tagNNSSlistHTML).text() + "</a>";
        var sppListHeaderHTML = "<h5 class='inline-head species-headline-" + SHOW_CONF.tagNNSSlist + "'>" + NNSSform;
        sppListHeaderHTML += "</h5>";
        $(sppListHeaderHTML).appendTo(".header-inner");
        $("#NNSSform_submit_header").click(function() {
            $("#NNSSform_header").submit();
            return false;
        });
    } else {
        NNSSform += "<a id='NNSSform_submit' href='#'>NNSS</a>";
        $(".panel-resources ul").append('<li id="NNSSform_link">' + NNSSform + '&nbsp;<img src="/assets/newtab.gif"/></li>');
        $("#NNSSform_submit").click(function() {
            $("#NNSSform").submit();
            return false;
        });
    }
}

function addNNSSbiosecurityLinks(links, specieslist) {
    var listOnlineResources = JSON.parse(links);
    var drID = specieslist.dataResourceUid;
    $.each(listOnlineResources, function (idx, listOnlineResource) {
        if (listOnlineResource.specieslist == drID) {
            //add link under 'Online resources'
            var onlineResourceURL = (listOnlineResource.url).toLowerCase();
            var theLink = '';
            if (onlineResourceURL.startsWith("http:") || onlineResourceURL.startsWith("https:")) {
                //actual url
                if (listOnlineResource.openExternal == "true") {
                    theLink = '<a href="' + listOnlineResource.url + '" target="_new">';
                } else {
                    theLink = '<a href="' + listOnlineResource.url + '">';
                }
            } else {
                //is it a kvp value?
                if (specieslist.kvpValues.length > 0) {
                    $.each(specieslist.kvpValues, function (idx, kvpValue) {
                        if (kvpValue.key == listOnlineResource.url) {
                            theLink = kvpValue.value;
                            if (theLink.startsWith('<a ')) {
                                //all we need is the href value
                                var href = $('<div>').append(theLink).find('a:first').attr('href');
                                if (listOnlineResource.openExternal == "true") {
                                    theLink = '<a href="' + href.replace(/[']/g,'"') + '" target="_new">';
                                } else {
                                    theLink = '<a href="' + href.replace(/[']/g, '"') + '">';
                                }
                            } else {
                                if (listOnlineResource.openExternal == "true") {
                                    theLink = '<a href="' + theLink.replace(/[']/g, '"') + '" target="_new">';
                                } else {
                                    theLink = '<a href="' + theLink.replace(/[']/g, '"') + '" target="_new">';
                                }
                            }
                        }
                    });
                }
            }
            var decorateLink = '';
            if (listOnlineResource.openExternal == "true") {
                decorateLink = '&nbsp;<img src="/assets/newtab.gif"/>';
            }
            $(".panel-resources ul").prepend('<li class="taxon-listlink-custom" id="NNSSbiosecurity_link_' + idx + '">' + theLink + listOnlineResource.label + '</a>' + decorateLink + '</li>');
        }
    });

}
