package uk.org.nbn.places

import grails.converters.JSON

class SpeciesCategoryMarshaller {
    void register() {
        JSON.registerObjectMarshaller(SpeciesCategory) {
             it.name() 
        }
    }
}