package uk.org.nbn.places

class UrlMappings {

    static mappings = {
        "/$controller/$action?/$id?"{
            constraints {
                // apply constraints here
            }
        }
        // Redirects for BIE web services URLs
        "/geo"(controller: "places", action: "geoSearch")
        "/places/$guid**"(controller: "places", action: "show")
        "/places/species-count/$guid**"(controller: "places", action: "speciesCount")
        "/search"(controller: "places", action: "search")
        "/place-stats/$guid**"(controller: "places", action: "placeStats")
        "/image-search"(controller: "places", action: "imageSearch")
        "/image-search/showSpecies"(controller: "places", action: "imageSearch") // TODO remove?
        "/image-search/infoBox"(controller: "places", action: "infoBox")
        "/image-search/$id**"(controller: "places", action: "imageSearch")
        "/logout"(controller: "places", action: "logout")
        "/admin/"(controller:'admin', action: 'index')
        "/"(view:"/index")
        "500"(view:'/error')

        name fixResultList: "/search"(controller: "places", action: "search")
    }
}