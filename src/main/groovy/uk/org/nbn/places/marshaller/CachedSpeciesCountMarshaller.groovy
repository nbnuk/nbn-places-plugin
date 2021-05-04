package uk.org.nbn.places

import grails.converters.JSON

class CachedSpeciesCountMarshaller {
    void register() {
        JSON.registerObjectMarshaller(CachedSpeciesCount) {
            [
              categoryName : it.category,
              speciesCount : it.speciesCount,
              selectedSpeciesCount : it.selectedSpeciesCount
            ]
        }
    }
}