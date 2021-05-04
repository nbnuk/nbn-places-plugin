<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="${grailsApplication.config.skin.layout}"/>
    <asset:javascript src="moment.min.js"/>
    <asset:javascript src="importJobReporter.js"/>
    <title>Import Job Reporter</title>
</head>
<body>
 

<section class="container">

    <header class="pg-header">
        <h1>${jobReport?.description}</h1>
    </header>

<div id="jobReport" data-jobid="${jobReport.id}">
  
  <div id="jobReportError" style="min-height:1rem;margin-bottom:1rem"></div>

        <div id="jobReportContent">
        Please wait .....
        </div>   
        <div id="progressBar" style="font-size:2rem"></div>

       <div  style="margin-top:2rem;">
       <button id="retry"  type="button" class="btn btn-primary" style="display:none">Run failed imports again</button>
       </div>
       </div>
             <%-- <cl:isNotLoggedIn>
            <div class="homeCell">
              <h4 class="inline"><g:message code="admin.notlogin.title" /></h4>
                <span class="buttons" style="float: right;">
                  <a href="${grailsApplication.config.security.cas.loginUrl}?service=${grailsApplication.config.grails.serverURL}/admin">&nbsp;<g:message code="admin.notlogin.link" />&nbsp;</a>
                </span>
              <p><g:message code="admin.notlogin.des" /></p>
            </div>
          </cl:isNotLoggedIn> --%>

           

</section><!--end .inner-->
</body>
</html>