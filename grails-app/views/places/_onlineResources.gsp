<ul>
    <li>Archaeological Data Service <a href="https://archaeologydataservice.ac.uk/">visit website</a></li>
    <li>Explore Churches <a href="https://www.explorechurches.org">visit website</a></li>
    <li>Find an Archive <a href="https://discovery.nationalarchives.gov.uk/find-an-archive">visit website</a></li>
    <li>Historic Environment Records (England) <a href="https://www.heritagegateway.org.uk/Gateway/chr/">visit website</a></li>
    <li>Historic Environment Records (Wales) <a href="https://www.archwilio.org.uk/arch/">visit website</a></li>
    <g:if test="${placeDetails?.country_s == "England" && placeDetails?.chc_url_s}">
        <li>Church Heritage Record (England) <g:link url="${placeDetails?.chc_url_s}">visit website</g:link></li>
    </g:if>
    <g:else>
        <li>Church Heritage Record (England) <a href="https://facultyonline.churchofengland.org/churches">visit website</a></li>
    </g:else>
    <g:if test="${placeDetails?.country_s == "Wales" && placeDetails?.chc_url_s}">
        <li>Church Heritage Cymru (Wales) <g:link url="${placeDetails?.chc_url_s}">visit website</g:link></li>
    </g:if>
    <g:else>
        <li>Church Heritage Cymru (Wales) <a href="https://churchheritagecymru.org.uk/churches">visit website</a></li>
    </g:else>

    <li>People's Collection Wales <a href="https://www.peoplescollection.wales/">visit website</a></li>
</ul>