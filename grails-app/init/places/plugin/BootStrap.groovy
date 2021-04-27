package places.plugin

import uk.org.nbn.places.SpeciesCategoryMarshaller

class BootStrap {

    def init = { servletContext ->

         [ new SpeciesCategoryMarshaller() ].each { it.register() }

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
