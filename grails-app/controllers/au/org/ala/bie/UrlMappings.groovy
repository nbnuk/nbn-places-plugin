package au.org.ala.bie

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
        "/search"(controller: "places", action: "search")
        "/occurrences"(controller: "places", action: "occurrences") // RR added
        "/place-stats/$guid**"(controller: "places", action: "placeStats") //RR added
        "/image-search"(controller: "places", action: "imageSearch")
        "/image-search/showSpecies"(controller: "places", action: "imageSearch")
        "/image-search/infoBox"(controller: "places", action: "infoBox")
        "/image-search/$id**"(controller: "places", action: "imageSearch")
        "/bhl-search"(controller: "places", action: "bhlSearch")
        "/sound-search"(controller: "places", action: "soundSearch")
        "/logout"(controller: "places", action: "logout")
        "/"(view:"/index")
        "500"(view:'/error')

        name fixResultList: "/search"(controller: "places", action: "search")
    }
}