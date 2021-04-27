package uk.org.nbn.places

import java.sql.Timestamp

class SpeciesCount implements Serializable {

    

    String placeId
    SpeciesCategory category 

    int count
    int principalImportanceCount

    Timestamp lastUpdated


    static mapping = {
        table 'cached_species_counts'
        id composite:['placeId', 'category'] 
        placeId column:  'placeId'
        category column:  'category', sqlType: "enum", enumType: "string"
        count column:  'count'
        principalImportanceCount column: 'principalImportanceCount'
        lastUpdated column: 'lastUpdated', type: Timestamp, sqlType: "timestamp"
    }

    static constraints = {
        placeId nullable: false
        category  nullable: false      
    }

  
    String toString(){
        placeId + " " + category + " " +count +" "+principalImportanceCount
    }
}
