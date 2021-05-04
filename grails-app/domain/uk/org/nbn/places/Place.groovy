package uk.org.nbn.places


class Place implements Serializable {
    String id
    String name     
    int failedImport
    String importErrorMessage
    static hasMany = [cachedSpeciesCounts: CachedSpeciesCount]

    
    static mapping = {
        id type:'string',  generator: 'assigned' 
        cachedSpeciesCounts lazy:false   
        version false
    }

    static constraints = {
        importErrorMessage nullable : true
    }

  
    String toString(){
        id + " " + name
    }
}
