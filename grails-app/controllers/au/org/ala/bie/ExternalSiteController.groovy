/*
 * Copyright (C) 2018 Atlas of Living Australia
 * All Rights Reserved.
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 */

package au.org.ala.bie

import com.google.common.util.concurrent.RateLimiter
import grails.converters.JSON
import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import org.apache.commons.lang.StringUtils
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.jsoup.select.Elements

import java.text.MessageFormat

/**
 * Controller that proxies external webservice calls to get around cross domain issues
 * and to make consumption of services easier from javascript.
 */
class ExternalSiteController {

    def index() {}

    /**
     * Proxy autocomplete requests to bie-index
     *
     */
    def proxyAutocomplete = {
        URL url = ( "${grailsApplication.config.getProperty("bie.index.url")}/search/auto.json" + params.toQueryString() ).toURL()
        StringBuilder content = new StringBuilder()
        BufferedReader bufferedReader

        try {
            HttpURLConnection connection = url.openConnection()
            connection.setRequestMethod("GET")
            connection.connect()
            bufferedReader = new BufferedReader(new InputStreamReader(connection.getInputStream()))
            String line
            // read from the connection via the bufferedreader
            while ((line = bufferedReader.readLine()) != null) {
                content.append(line + "\n")
            }
            response.setContentType(connection.getContentType())
            response.status = connection.getResponseCode()
            render content.toString() //render url.getText()
        } catch (Exception e) {
            // will bubble up to Grails and trigger an error page
            log.error "${e.message}", e
        } finally {
            if (bufferedReader) {
                bufferedReader.close() // can throw exception but passing on to Grails error handling
            }
        }
    }
}