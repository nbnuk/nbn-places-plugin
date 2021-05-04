package places.plugin

import uk.org.nbn.places.CachedSpeciesCountMarshaller
import uk.org.nbn.places.JobStatusMarshaller
import uk.org.nbn.places.PlaceMarshaller


class BootStrap {

    def init = { servletContext ->

         [ new PlaceMarshaller(), new CachedSpeciesCountMarshaller(), new JobStatusMarshaller() ].each { it.register() }

        Object.metaClass.trimLength = { Integer stringLength ->

            String trimString = delegate?.toString()    
            String concatenateString = "..."
            List separators = [".", " "]

            if (stringLength && (trimString?.length() > stringLength)) {
                trimString = trimString.substring(0, stringLength - concatenateString.length())
                String separator = separators.findAll { trimString.contains(it) }?.min { trimString.lastIndexOf(it) }
                if (separator) {
                    trimString = trimString.substring(0, trimString.lastIndexOf(separator))
                }
                trimString += concatenateString
            }
            return trimString
        }
    }

    def destroy = {
    }
}
