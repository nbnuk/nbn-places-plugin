package uk.org.nbn.places

import java.sql.Timestamp

class CachedSpeciesCount implements Serializable {
     int id
     String category 
     int speciesCount
     int selectedSpeciesCount
     Timestamp lastUpdated
    static belongsTo= [place:Place]


    static mapping = {
      version false
    }

    static constraints = {
       category  nullable: false      
    }

  
    String toString(){
        place?.id + " " + category + " " +speciesCount +" "+selectedSpeciesCount
    }
}
