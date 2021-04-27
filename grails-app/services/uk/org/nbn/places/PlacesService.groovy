package uk.org.nbn.places


class PlacesService {

    List getSpeciesCountByPlaceId(String placeId){
        def res =  SpeciesCount.findAllByPlaceId(placeId)        
        return res;
    }

    
    // void import(){
        //obviously this would be ridiculously inefficient but without knowing what the api calls are 
        //it'll do for now as a description
        //get the placeIds,
        //get the categories
        //for each placeId 
            //for each category 
                //get the count for placeId_category
                //get ofPrincipalImportanceCount
                //create record
            //
        //

    // }
}
