$(document).ready(function() {

 
    

function loadProgress(){
    const jobId = $('#jobReport').data('jobid')
    

    

    $.getJSON(`/admin/jobProgress/${jobId}`, function(data){   
        const jobReport = data.jobReport        
        if (!jobReport) 
            $('#jobReport').html("<p> There are no jobs to report on</p>")   
        else{
            $('#progressBar').append(".")

            $('#jobReportContent').html(renderJobReport(jobReport))

            if (jobReport.jobStatus !== 'FINISHED')
                setTimeout(loadProgress, 5000)
            else {
                $("#progressBar").hide()
                if (jobReport.count2>0){
                    $("#retry").show();
                }
            }
        } 
        

    }).fail(function(jqxhr, textStatus, error) {
        $('#jobReportError').text("Error obtaining progress report: " + jqxhr.status + ' '+ textStatus + ', ' + error)     
    });

}



function renderJobReport(jobReport){
    const timeTaken = (jobReport.jobStatus==="FINISHED")? new Date(jobReport.endDate).getTime()-new Date(jobReport.startDate).getTime():null;
        
    let result=`<p>
    Job started: ${moment(jobReport.startDate).format('lll')}
    <br />Total number places: ${jobReport.count3}
    <br />Number places processed: ${jobReport.count0}
    <br />Number places failed to import: ${jobReport.count2}
    <br />Number species count records created: ${jobReport.count1}
    <br />Job Status: ${jobReport.jobStatus}
    <br />${jobReport.jobStatus==="FINISHED"||jobReport.jobStatus==="RUNNNIG_RETRY_FAILED_IMPORTS"?`Time taken: ${moment.utc(timeTaken).format("HH:mm:ss")}`:"&nbsp;"}
    </p>`

    result +="<div style='min-height:100px;' id='jobMessage'>"+(jobReport.info?`Last job message:<br/>${jobReport.info}`:'-')+"</div>"

    return result

}

$("#retry").on("click", function() {
    $('#jobMessage').text('')    
    const jobId = $('#jobReport').data('jobid');
    $("#retry").hide();
    retryImports(jobId)
       
});


function retryImports(jobId){

    $.ajax({
        url: "/admin/retryFailedImportSpeciesCountCache/"+jobId,
        success: function(data) {
        },
        error: function(jqxhr, textStatus, error) {
            $('#jobReportError').text(jqxhr.status + ' '+ textStatus + ', ' + error) 
        } 
    });

    setTimeout(loadProgress,2000)
}



setTimeout(loadProgress,1000)
})