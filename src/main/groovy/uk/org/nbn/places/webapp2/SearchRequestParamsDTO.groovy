/*
 * Copyright (C) 2012 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 */

package uk.org.nbn.places.webapp2

import jdk.nashorn.internal.runtime.URIUtils
import org.apache.commons.httpclient.util.URIUtil

/**
 * DTO to pass search request params between classes
 * 
 * @author Nick dos Remedios (nick.dosremedios@csiro.au)
 */
class SearchRequestParamsDTO {
    def q
    def fq
    def start
    def rows
    def sort
    def dir

    SearchRequestParamsDTO(q, fq, start, rows, sort, dir) {
        this.q = q
        this.fq = fq
        this.start = start
        this.rows = rows
        this.sort = sort
        this.dir = dir
    }

    def getQueryString() {
        def queryStr = new StringBuilder()
        queryStr.append("q=" + URIUtil.encodeWithinQuery(q)) //q.encodeAsURL())
        def fqIsList = fq.getClass().metaClass.getMetaMethod("join", String)
        if (fq && fqIsList) {
            //def newFq = fq.collect { it.replaceAll(/\s+/, "+") }
            def newFq = fq.collect { URIUtil.encodeWithinQuery(it).replaceAll("%26","&").replaceAll("%3D","=").replaceAll("%3A",":") }
            queryStr.append("&fq=" + newFq?.join("&fq="))
        } else if (fq) {
            queryStr.append("&fq=" + URIUtil.encodeWithinQuery(fq).replaceAll("%26","&").replaceAll("%3D","=").replaceAll("%3A",":"))
        }
        if (start) queryStr.append("&start=" + start)
        if (rows)  queryStr.append("&rows=" + rows)
        if (sort) queryStr.append("&sort=" + sort)
        if (dir) queryStr.append("&dir=" + dir)
        return queryStr.toString()
    }

    static String buildFilteryQueryParams(fqList){
       
        def queryStr="";
        def newFq = fqList.collect { URIUtil.encodeWithinQuery(it).replaceAll("%26","&").replaceAll("%3D","=").replaceAll("%3A",":") }
      
       return "&fq=" +newFq?.join("&fq=")       
    }

    public String toString() {
        return getQueryString()
    }
}

