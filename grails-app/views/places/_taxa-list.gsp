<section class="tab-pane fade" id="taxa-list">
    <table id="taxaList" class="table table-bordered table-striped table-condensed">
        <thead style="font-weight:bold">
        <tr>
            <th>Taxa</th>
            <th>No. of records</th>
            <th>Most recent record</th>
        </tr>
        </thead>
        <tbody>

            <g:if test="${taxonList}">
            <g:if test="${taxonList[0].fieldResult}">
            <g:each in="${taxonList[0].fieldResult}" status="i" var="result">
                <tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
                    <td>
                        <a href="${bieUrl}/species/${result.label.split('\\|')[1]}">${result.label.split('\\|')[0]}</a>
                        <g:if test="${result.label.split('\\|')[2]?:'' != ''}"> (${result.label.split('\\|')[2]})</g:if>
                    </td>
                    <td><a href="${biocacheUrl}/occurrences/search?q=${shape_filter ?: ''}${recordsFilterToggle? '&fq='+recordsFilter : ''}&fq=taxon_concept_lsid:${result.label.split('\\|')[1]}">${result.count}</a></td>
                    <td>Not known</td>
                </tr>
            </g:each>
            </g:if>
            <g:else>
                <g:each in="${taxonList[0].pivotStatsResult}" status="i" var="result">
                    <tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
                        <td><a href="${bieUrl}/species/${result.value.split('\\|')[1]}">${result.value.split('\\|')[0]}</a>
                            <g:if test="${result.value.split('\\|')[2]?:'' != ''}"> (${result.value.split('\\|')[2]})</g:if></td>
                        <td><a href="${biocacheUrl}/occurrences/search?q=${shape_filter ?: ''}${recordsFilterToggle? '&fq='+recordsFilter : ''}&fq=taxon_concept_lsid:${result.value.split('\\|')[1]}">${result.count}</a></td>
                        <td>${result.stats.findAll(/\d+/)*.toInteger()[0]}</td>
                    </tr>
                </g:each>
            </g:else>
            </g:if>
        </tbody>
    </table>
</section>
%{--
The sort of queries we want to run on SOLR are as follows:

Group by taxon and give count and max year
http://52.58.94.30:8983/solr/biocache_live/select?fq=cl143:%22Kensal%20Green%20Cemetery%22&facet.pivot={!stats=piv1}names_and_lsid&facet=true&indent=on&q=*:*&rows=0&start=0&wt=json&f.names_and_lsid.facet.sort=index&facet.limit=-1&stats=true&stats.field={!tag=piv1%20max=true}year

equivalent biocache-service call (using dev branch):
https://records-ws.nbnatlas.org/occurrence/pivotStats?fq=cl143:%22Kensal%20Green%20Cemetery%22&facets=%7B!stats=piv1%7Dnames_and_lsid&apiKey=c1dea9e6-33e2-4521-862f-89c988ba9216&flimit=100&fsort=index&stats=%7B!tag=piv1%20max=true%7Dyear


Enabled this in biocache-service, gives max year but not count so far (and bits are hardcoded):
http://localhost:8081/occurrence/stats?fq=cl16:*&facets=names_and_lsid,year&apiKey=c1dea9e6-33e2-4521-862f-89c988ba9216

Group by taxon and year and give counts for both
http://52.58.94.30:8983/solr/biocache_live/select?fq=cl143:"Kensal Green Cemetery"&facet.pivot=names_and_lsid,year&facet=true&indent=on&q=*:*&rows=0&start=0&wt=json&f.names_and_lsid.facet.sort=index&f.year.facet.sort=index&facet.limit=-1

equivalent biocache-service call:

https://records-ws.nbnatlas.org/occurrence/pivot?fq=cl143:%22Kensal%20Green%20Cemetery%22&facets=names_and_lsid,year&fsort=index&apiKey=c1dea9e6-33e2-4521-862f-89c988ba9216


--}%