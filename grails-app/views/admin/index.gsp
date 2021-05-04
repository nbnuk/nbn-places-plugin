<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="${grailsApplication.config.skin.layout}"/>
    <title>Places Admin</title>
</head>
<body>


<section class="container">

    <header class="pg-header">
        <h1>Administration</h1>
    </header>


    
             <%-- <cl:isNotLoggedIn>
            <div class="homeCell">
              <h4 class="inline"><g:message code="admin.notlogin.title" /></h4>
                <span class="buttons" style="float: right;">
                  <a href="${grailsApplication.config.security.cas.loginUrl}?service=${grailsApplication.config.grails.serverURL}/admin">&nbsp;<g:message code="admin.notlogin.link" />&nbsp;</a>
                </span>
              <p><g:message code="admin.notlogin.des" /></p>
            </div>
          </cl:isNotLoggedIn> --%>

            <ul>
                <li><g:link controller="admin" action="importSpeciesCountCache">Import Species Count Cache</g:link></li>
            </ul>

</section><!--end .inner-->
</body>
</html>