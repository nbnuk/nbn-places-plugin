package uk.org.nbn.places

import grails.converters.JSON

class PlaceMarshaller {
    void register() {
        JSON.registerObjectMarshaller(Place) {
            [
                place: [
                    guid:it.id,
                    name:it.name
                ],
                speciesCounts: it.cachedSpeciesCounts
            ]
        }
    }
} 