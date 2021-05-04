package uk.org.nbn.places


class PlacesService {

    def getPlaceWithSpeciesCounts(String id){
        def res =  Place.get(id)        
        return res;       
    }

}
