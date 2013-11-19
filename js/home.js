var isFilter = false;
var oTable;
var row_count = 10;
function showEventPage(){

    //load header
    //set session
    $.session.set(session_keys.CURRENT_PAGE,current_page.HOME_PAGE);
    //showHeader();

    $('#content').load(templates.PAGE_HOME,function() {
        status_filter = STATUS.ALL;
       // $("#spinner").show();
        showEventList();
        isFilter = false;
        if($.cookie(session_keys.STATUS_FILTER) != null || $.cookie(session_keys.STATUS_FILTER) != ""){
            status_filter = $.cookie(session_keys.STATUS_FILTER);
            if(status_filter == STATUS.OPEN) {
                $(".event-filters").removeClass("active");
                $("#open_status").addClass("active");
            } else if(status_filter == STATUS.CLOSE){
                $(".event-filters").removeClass("active");
                $("#close_status").addClass("active");
            } else if(status_filter == STATUS.ALL){
                $(".event-filters").removeClass("active");
                $("#all_status").addClass("active");
            }else{
                status_filter = STATUS.ALL;
            }
        }
        if($.session.get(session_keys.EVENT_ROW_COUNT) != null && $.session.get(session_keys.EVENT_ROW_COUNT) != "" && $.session.get(session_keys.EVENT_ROW_COUNT) != undefined){
            row_count =  $.session.get(session_keys.EVENT_ROW_COUNT);
        }else if($.cookie(session_keys.EVENT_ROW_COUNT) != null  && $.cookie(session_keys.EVENT_ROW_COUNT) != ""){
            row_count =  $.cookie(session_keys.EVENT_ROW_COUNT);
        }else{
            row_count = 10;
        }
        $('#open_status').click(function(){
            $(".event-filters").removeClass("active");
            $("#open_status").addClass("active");
            status_filter = STATUS.OPEN;
            isFilter = true;
            showEventList();
            $.cookie(session_keys.STATUS_FILTER,STATUS.OPEN);
        });

        $('#close_status').click(function(){
            $(".event-filters").removeClass("active");
            $("#close_status").addClass("active");
            status_filter = STATUS.CLOSE;
            isFilter = true;
            showEventList();
            $.cookie(session_keys.STATUS_FILTER,STATUS.CLOSE);
        });

        $('#all_status').click(function(){
            $(".event-filters").removeClass("active");
            $("#all_status").addClass("active");
            status_filter = STATUS.ALL;
            isFilter = true;
            showEventList();
            $.cookie(session_keys.STATUS_FILTER,STATUS.ALL);
        });
        $("#referenceId").attr("placeholder",$.session.get(session_keys.REF_ID_LABEL));

        ajaxGETRequest(serviceURLs.GET_ACTIVE_USER,showMembersList);
        $("#member_list").select2();

        ajaxGETRequest(serviceURLs.GET_TAGS,showTagsList);
        $("#tag_list").select2();
    });


}

function showEventList(){
    $("#ref_id_label").html($.session.get(session_keys.REF_ID_LABEL));
    showHeader("home_button");
    $("#table_spinner").show();
    ajaxGETRequest1(serviceURLs.GET_SEVENT_LIST,loadEventList);
    //set pagination

    $('#eventListTable').dataTable().fnDestroy();

    var $tabs = $('.tabbable li');


    $('#prevtab').on('click', function() {
        $tabs.filter('.active').prev('li').find('a[data-toggle="tab"]').tab('show');
    });

    $('#nexttab').on('click', function() {
        $tabs.filter('.active').next('li').find('a[data-toggle="tab"]').tab('show');
    });


    $("#submitNewEvent").click(function (e){
        e.preventDefault();

        buildAddEventRequest();
    });
    resizeSettings();
}

function buildAddEventRequest(){
    /*event name */
    var event_fields = ["eventName"];
    var event_address = ["address1","address2","city","state","zipCode","country"];
    var ret = true;
    var message = "Please enter mandatory fields from below tabs";

    $("#event_details").css({"color":"#696969"});
    $("#event_location").css({"color":"#696969"});

    if(!validateEventForm(event_fields)){
        ret = false;
        message += "<li>Event details</li>";
        $("#event_details").css({"color":"#FC0000"});
    }
    if(!validateEventForm(event_address)){
        message += "<li>Event Location</li>";
        $("#event_location").css({"color":"#FC0000"});
        ret = false;
    }
      if(ret == false){
          errorMessage(message);
          return false;
      }
        var newEventRequest = '{"eventName":"'+$("#eventName").val()+'","eventDetails":"'+$("#eventDetail").val()+'","referenceId":"'+$("#referenceId").val()+'",';
        newEventRequest +=	'"address":[{"addressLine1":"'+$("#address1").val()+'","addressLine2":"'+$("#address2").val()+'","city":"'+$("#city").val()+'","state":"'+$("#state").val()+'","zipCode":"'+$("#zipCode").val()+'","country":"'+$("#country").val()+'"}],';
        newEventRequest += '"members":'+JSON.stringify($("#member_list").select2("val"))+',"tags":'+JSON.stringify($("#tag_list").select2("val"))+'}';
        console.log(newEventRequest);
        ajaxPOSTRequest(newEventRequest,serviceURLs.GET_EVENT_LIST,addEventSuccess);

}


function  validateEventForm(validation_fields){
    var isError = 0;
    for(i=0;i<validation_fields.length;i++){
        if($("#"+validation_fields[i]).val() == ""){
            isError++;
            $("#"+validation_fields[i]).css({"border":"1px solid red"});
        }else{

            $("#"+validation_fields[i]).css({"border":"1px solid #ddd"});
        }
    }
    if(isError == 0){
        return true;
    }else{

        return false;
    }
}
function addEventSuccess(data){
    isFilter = true;
    $('#eventListTable').dataTable().fnDestroy();
    showEventList();
    $('#addEventForm')[0].reset();
    $("#eventModal").modal('hide');
}

function showMembersList(userList){

    for(i=0;i<userList.userlist.length;i++){
        $("#member_list").append('<option value="'+userList.userlist[i]._id+'">'+camelCase(userList.userlist[i].lastName+' '+userList.userlist[i].firstName)+'</option>');
    }

}

function showTagsList(tagList){
    for(i=0;i<tagList.length;i++){
        if(tagList[i].tagType == 0){
            $("#tag_list").append('<option value="'+tagList[i].id+'">'+tagList[i].tagName+'</option>');
        }

    }
}

function loadEventList(eventList){
    $("#table_spinner").hide();
    if(eventList == 'error'){
        $('#eventListTable > tbody')
            .append('<tr><td colspan="6" style="text-align: center"><strong>No event exist</strong></td></tr>');
        $("#status_bar").hide();
        return;
    }

    var events = eventList['eventlist'];
    if(events != null && events.length > 0 ){
        console.log("events are > 0 "+events.length);
        $('#eventListTable').css({"display":"none"});
        $("#eventListTable > tbody").html("");
        for(var i=0;i<events.length;i++){
            var statusClass = "badge-success";
            var role = "Owner";
            var ref_id="";
            var eventDetails = "";
            var members = "";
            var tags = "";
            var statusCl = "busy";
            var status = "Open";
            if((status_filter == STATUS.ALL) || (events[i].status.toLowerCase().indexOf(status_filter.toLowerCase()) != -1)){

                if(events[i].createdBy != $.session.get(session_keys.ID)){
                    role = "Contributor";
                }
                if(events[i].status == "Closed" || events[i].status == "Close" || events[i].status == "closed" || events[i].status == "close"){
                    statusClass = "badge-info";
                    statusCl = 'online';
                    status = "Closed";
                }else{
                    status = "Open";
                    statusClass = "badge-success";
                    statusCl = 'busy';
                }
                if(events[i].referenceId != null){
                    ref_id =  events[i].referenceId;
                }

                if(events[i].eventDetails != null){
                    eventDetails = events[i].eventDetails;
                }
                if(events[i].members != null){
                    members =  events[i].members;
                }
                if(events[i].tags != null ){
                    tags =   events[i].tags;
                }

                var dateCr = new Date.parse(events[i].dateCreated+" GMT".replace(/-/g, "/"));
                var dateMod = new Date.parse(events[i].modifiedDate+" GMT".replace(/-/g, "/"));
                var createdDt = formatDat(dateCr);
                var modDt = formatDat(dateMod);
                //var createdDt = dateCr.getMonth()+1+ "-" +dateCr.getDate()+ "-" +dateCr.getFullYear()+ " " + (dateCr.getHours()<10?'0':'') + dateCr.getHours()+ ":" + (dateMod.getMinutes()<10 ? '0' : '') + dateCr.getMinutes();
                //var modDt = dateMod.getMonth()+1+ "-" +dateMod.getDate()+ "-" +dateMod.getFullYear()+ " " + (dateMod.getHours()<10?'0':'') + dateMod.getHours()+ ":" + (dateMod.getMinutes()<10 ? '0' : '') + dateMod.getMinutes();

                $('#eventListTable > tbody')
                    .append('<tr data-toggle="collapse" data-target="'+events[i]._id+'"><td style="padding-left:20px">'+
                        '<a class="eventIdTips" data-toggle="tooltip" data-placement="right" title="'+events[i]._id+'" href="javascript:showEventDetails(\''+events[i]._id+'\')">'+events[i].eventName+
                        '</a></td><td class="hidden-phone hidden-tablet"><center>'+ref_id+
                        '</center></td><td class="hidden-phone hidden-tablet"><center>'+createdDt+
                        '</center></td><td><center>'+modDt+
                        '</center></td><td><center><span class="hidden-tablet hidden-desktop status '+statusCl+'"/><span class="hidden-phone hidden-tablet"><span class="badge '+statusClass+'">'+status+'</span></span>'+
                        '</center></td><td class="hidden-phone hidden-tablet"><center>'+role+
                        '</center></td><td class="hidden">'+
                        'Event Details : '+eventDetails+
                        '<br/><div class="alert alert-info"><strong>Members :</strong> '+members+'<br /><strong>Tags : </strong>'+tags+'</div></td></tr>');
            }
        }
        $('#eventListTable').fadeIn('slow');
        $(".eventIdTips").tooltip();

        addPagination();
        $('#eventListTable').css({"width":"100%"});

    }  else{
        $('#eventListTable > tbody')
            .append('<tr><td colspan="6" style="text-align: center"><strong>No event exist</strong></td></tr>');
        $("#status_bar").hide();
    }

}


function formatDat(date) {
    return (((date.getMonth()+1)<10?'0':'') + (date.getMonth()+1))+ "-" +((date.getDate()<10?'0':'')+date.getDate()) + "-"+
        date.getFullYear()  + " " +((date.getHours()<10?'0':'')+date.getHours()) + ":" +
        (date.getMinutes()<10?'0':'') +  date.getMinutes();
}

function addPagination(){
    /* Set the defaults for DataTables initialisation */
    $.extend( true, $.fn.dataTable.defaults, {
         "sPaginationType": "bootstrap",
        "oLanguage": {
            "sLengthMenu": "_MENU_ records per page"
        }
    } );


    /* Default class modification */
    $.extend( $.fn.dataTableExt.oStdClasses, {
        "sWrapper": "dataTables_wrapper form-inline"
    } );


    /* API method to get paging information */
    $.fn.dataTableExt.oApi.fnPagingInfo = function ( oSettings )
    {
        return {
            "iStart":         oSettings._iDisplayStart,
            "iEnd":           oSettings.fnDisplayEnd(),
            "iLength":        oSettings._iDisplayLength,
            "iTotal":         oSettings.fnRecordsTotal(),
            "iFilteredTotal": oSettings.fnRecordsDisplay(),
            "iPage":          oSettings._iDisplayLength === -1 ?
                0 : Math.ceil( oSettings._iDisplayStart / oSettings._iDisplayLength ),
            "iTotalPages":    oSettings._iDisplayLength === -1 ?
                0 : Math.ceil( oSettings.fnRecordsDisplay() / oSettings._iDisplayLength )
        };
    };


    /* Bootstrap style pagination control */
    $.extend( $.fn.dataTableExt.oPagination, {
        "bootstrap": {
            "fnInit": function( oSettings, nPaging, fnDraw ) {
                var oLang = oSettings.oLanguage.oPaginate;
                var fnClickHandler = function ( e ) {
                    e.preventDefault();
                    if ( oSettings.oApi._fnPageChange(oSettings, e.data.action) ) {
                        fnDraw( oSettings );
                    }
                };

                $(nPaging).addClass('pagination').append(
                    '<ul>'+
                        '<li class="prev disabled"><a href="#">&larr; '+oLang.sPrevious+'</a></li>'+
                        '<li class="next disabled"><a href="#">'+oLang.sNext+' &rarr; </a></li>'+
                        '</ul>'
                );
                var els = $('a', nPaging);
                $(els[0]).bind( 'click.DT', { action: "previous" }, fnClickHandler );
                $(els[1]).bind( 'click.DT', { action: "next" }, fnClickHandler );
            },

            "fnUpdate": function ( oSettings, fnDraw ) {
                var iListLength = 5;
                var oPaging = oSettings.oInstance.fnPagingInfo();
                var an = oSettings.aanFeatures.p;
                var i, ien, j, sClass, iStart, iEnd, iHalf=Math.floor(iListLength/2);

                if ( oPaging.iTotalPages < iListLength) {
                    iStart = 1;
                    iEnd = oPaging.iTotalPages;
                }
                else if ( oPaging.iPage <= iHalf ) {
                    iStart = 1;
                    iEnd = iListLength;
                } else if ( oPaging.iPage >= (oPaging.iTotalPages-iHalf) ) {
                    iStart = oPaging.iTotalPages - iListLength + 1;
                    iEnd = oPaging.iTotalPages;
                } else {
                    iStart = oPaging.iPage - iHalf + 1;
                    iEnd = iStart + iListLength - 1;
                }

                for ( i=0, ien=an.length ; i<ien ; i++ ) {
                    // Remove the middle elements
                    $('li:gt(0)', an[i]).filter(':not(:last)').remove();

                    // Add the new list items and their event handlers
                    for ( j=iStart ; j<=iEnd ; j++ ) {
                        sClass = (j==oPaging.iPage+1) ? 'class="active"' : '';
                        $('<li '+sClass+'><a href="#">'+j+'</a></li>')
                            .insertBefore( $('li:last', an[i])[0] )
                            .bind('click', function (e) {
                                e.preventDefault();
                                oSettings._iDisplayStart = (parseInt($('a', this).text(),10)-1) * oPaging.iLength;
                                fnDraw( oSettings );
                            } );
                    }

                    // Add / remove disabled classes from the static elements
                    if ( oPaging.iPage === 0 ) {
                        $('li:first', an[i]).addClass('disabled');
                    } else {
                        $('li:first', an[i]).removeClass('disabled');
                    }

                    if ( oPaging.iPage === oPaging.iTotalPages-1 || oPaging.iTotalPages === 0 ) {
                        $('li:last', an[i]).addClass('disabled');
                    } else {
                        $('li:last', an[i]).removeClass('disabled');
                    }
                }
            }
        }
    } );


    /*
     * TableTools Bootstrap compatibility
     * Required TableTools 2.1+
     */
    if ( $.fn.DataTable.TableTools ) {
        // Set the classes that TableTools uses to something suitable for Bootstrap
        $.extend( true, $.fn.DataTable.TableTools.classes, {
            "container": "DTTT btn-group",
            "buttons": {
                "normal": "btn",
                "disabled": "disabled"
            },
            "collection": {
                "container": "DTTT_dropdown dropdown-menu",
                "buttons": {
                    "normal": "",
                    "disabled": "disabled"
                }
            },
            "print": {
                "info": "DTTT_print_info modal"
            },
            "select": {
                "row": "active"
            }
        } );

        // Have the collection use a bootstrap compatible dropdown
        $.extend( true, $.fn.DataTable.TableTools.DEFAULTS.oTags, {
            "collection": {
                "container": "ul",
                "button": "li",
                "liner": "a"
            }
        } );
    }

    initTable();
}

function initTable(){
    /*
     * Insert a 'details' column to the table
     */
    var nCloneTh = document.createElement( 'th' );
    var nCloneTd = document.createElement( 'td' );
    nCloneTd.innerHTML = '<img class="more_button" src="images/details_open.png">';
    nCloneTd.className = "center";
    console.log("init table");
    if(!isFilter){
        $('#eventListTable thead tr').each( function () {

            this.insertBefore( nCloneTh, this.childNodes[0] );
        } );
    }

    $('#eventListTable tbody tr').each( function () {
       /* if(isFilter){
            $(this).filter("td:eq(1)").remove();
        }*/
        this.insertBefore(  nCloneTd.cloneNode( true ), this.childNodes[0] );
    } );

    oTable = $('#eventListTable').dataTable( {
        "sDom": "<'row'<'#event_search_box' f><'#event_pagination' p>r>t<'row'<'span6'l><'span6'>>",
        "sPaginationType": "bootstrap",
        "bDestroy": true,
        "oLanguage": {
            "sLengthMenu": "_MENU_ records per page"
        },
        "aaSorting": [[ 4, "desc" ]],
        "aoColumnDefs": [
            { "bSortable": false, "aTargets": [0,2,5,6 ] },
            { "bSearchable": false, "aTargets": [2,6] }
        ],
        "iDisplayLength": row_count
    } );
    $("#event_search_box").addClass("span4 offset2");
    $("#event_pagination").addClass("span4 pull-right");
    resizeSettings();

    /* Add event listener for opening and closing details
     * Note that the indicator for showing which row is open is not controlled by DataTables,
     * rather it is done here
     */
    $(document).off('click', '#eventListTable .more_button');
    $(document).on('click','#eventListTable .more_button', function () {
        var nTr = $(this).parents('tr')[0];
        if ( oTable.fnIsOpen(nTr) )
        {
            /* This row is already open - close it */
            this.src = "images/details_open.png";
            oTable.fnClose( nTr );
        }
        else
        {
            /* Open this row */
            this.src = "images/details_close.png";
            oTable.fnOpen( nTr, fnFormatDetails(oTable, nTr), 'details' );
        }
    } );

    $("#row_count").change(function(){
        var rows = $("#row_count").val();
        row_count = rows;
        $.session.set(session_keys.EVENT_ROW_COUNT,rows);
        $.cookie(session_keys.EVENT_ROW_COUNT,rows);
    }) ;
};


function fnFormatDetails ( oTable, nTr )
{
    var aData = oTable.fnGetData( nTr );
    var sOut = '<table cellpadding="5" cellspacing="0" border="0" >';
    sOut += '<tr><td style="padding:0 30px;border:none;">'+aData[7]+'</td></tr>';
    sOut += '</table>';
    return sOut;
}
