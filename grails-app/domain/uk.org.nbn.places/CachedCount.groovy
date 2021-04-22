package uk.org.nbn.places

class CachedSpeciesCount {
    Date lastUpdated
    String placeId
    String category
    Integer speciesCount
    Integer principleImportanceSpeciesCount

    static constraints = {
        speciesCount(min: 0)
        principleImportanceSpeciesCount(min: 0)
    }
}
