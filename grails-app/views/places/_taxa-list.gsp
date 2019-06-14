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