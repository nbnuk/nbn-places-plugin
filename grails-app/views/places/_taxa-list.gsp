<section class="tab-pane fade" id="taxa-list">
    <div class="result-options">
        <span class="record-cursor-details">Showing <b>${(params.offset ?: 0).toInteger() + 1} - ${Math.min((params.offset ?: 0).toInteger() + (params.rows ?: (grailsApplication.config?.show?.taxa?.defaultRows ?: 20)).toInteger(), taxonListCount)}</b> of <b>${taxonListCount}</b> results</span>

        <form class="form-inline">
            <div class="form-group">
                <label for="per-page">Results per page</label>
                <select class="form-control input-sm" id="per-page" name="per-page">
                    <option value="10" ${(params.rows == '10' || (!params.rows && grailsApplication.config?.show?.taxa?.defaultRows == '10')) ? "selected=\"selected\"" : ""}>10</option>
                    <option value="20" ${(params.rows == '20' || (!params.rows && grailsApplication.config?.show?.taxa?.defaultRows == '20')) ? "selected=\"selected\"" : ""}>20</option>
                    <option value="50" ${(params.rows == '50' || (!params.rows && grailsApplication.config?.show?.taxa?.defaultRows == '50')) ? "selected=\"selected\"" : ""}>50</option>
                    <option value="100" ${(params.rows == '100' || (!params.rows && grailsApplication.config?.show?.taxa?.defaultRows == '100')) ? "selected=\"selected\"" : ""}>100</option>
                </select>
            </div>
            <div class="form-group">
                <label for="sort-by">Sort by</label>
                <select class="form-control input-sm" id="sort-by" name="sort-by">
                    <option value="index" ${(params.sortField == 'index' || (!params.sortField && grailsApplication.config?.show?.taxa?.defaultSortField == 'index')) ? "selected=\"selected\"" : ""}>taxon</option>
                    <option value="count" ${(params.sortField == 'count' || (!params.sortField && grailsApplication.config?.show?.taxa?.defaultSortField == 'count')) ? "selected=\"selected\"" : ""}>no. records</option>
                </select>
            </div>
        </form>

    </div><!-- result-options -->

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

    <div id="paginationTabTaxa">
        <tb:paginate total="${taxonListCount}"
                     max="${params.rows ?: (grailsApplication.config?.show?.taxa?.defaultRows ?: 20)}"
                     action="show"
                     params="${[guid: params.guid, sortField: (params.sortField ?: (grailsApplication.config?.show?.taxa?.defaultSortField ?: 'index')), rows: (params.rows ?: (grailsApplication.config?.show?.taxa?.defaultRows ?: 20))]}"/>
    </div>

</section>
