var serviceURLs, templates,sessionID, eventListOption, userObject, profileObject, eventDetail, referenceIDLabel, status_filter, member_status_filter;
status_filter = STATUS.ALL;
var isFormChanged = false;
$(document).ready(function() {
    $.cookie.json = true;
	//start with login
    $.ajaxSetup({
        cache: false
    });
    console.log("is logged in "+$.session.get(session_keys.IS_LOGGED_IN));
    if($.session.get(session_keys.IS_LOGGED_IN)){
        console.log("current page"+$.session.get(session_keys.CURRENT_PAGE));
        if($.session.get(session_keys.CURRENT_PAGE) == current_page.HOME_PAGE){
            showEventPage();
        }else if($.session.get(session_keys.CURRENT_PAGE) == current_page.ADMIN_PAGE) {
            showAdminControl();
        }else if($.session.get(session_keys.CURRENT_PAGE) == current_page.PROFILE_PAGE) {
            showProfile();
        }

    }else{
        console.log("is logged "+JSON.stringify($.cookie(cookieParams.IS_LOGGED))+" >> sess id"+$.cookie(cookieParams.VM_SESS_ID));
        if($.cookie(cookieParams.IS_LOGGED) == true){
            $.session.set(session_keys.SESSION_ID,$.cookie(cookieParams.VM_SESS_ID).replace(/\"/g,''));
            $.session.set(session_keys.IS_LOGGED_IN,true);
            $.session.set(session_keys.USER_ROLE,$.cookie(session_keys.USER_ROLE));
            $.session.set(session_keys.USER_NAME,$.cookie(session_keys.USER_NAME));
            $.session.set(session_keys.USER_ID,$.cookie(session_keys.USER_ID));
            $.session.set(session_keys.COMPANIES,$.cookie(session_keys.COMPANIES));
            $.session.set(session_keys.ID,$.cookie(session_keys.ID));
            $.session.set(session_keys.REF_ID_LABEL,$.cookie(session_keys.REF_ID_LABEL));
            showEventPage();
        }else{
            login();
        }
    }

    $( document ).ajaxSend(function( event, request, settings ) {
        $("#spinner").show();
    });

    $( document ).ajaxStop(function() {
       $("#spinner").hide();
    });

    $.pnotify.defaults.history = false;

    //media setup
    $(window).resize(function() {
        resizeSettings();
    });
    resizeSettings();
});


function setCompanyLogo(){

}


function resizeSettings(){
    //console.log("Windows size "+$(this).width());
    //tab settings
    if ($(this).width() <= 1025) {
        $("#admin_menu").removeClass("tabs-left");
        $("#add_new_menu").removeClass("tabs-left");
        $("#add_event_tab").removeClass("tabs-left");
        //$("#top_menu").removeClass("offset1");
        $("body").css({"padding":"0px"});

        $("#status_column").css({"width":"5%"});
        $("#content").css({"width":"100%"});
        $("#event_search_box").removeClass("offset2");
        $("#event_pagination").removeClass("span4");
        $("#event_pagination").addClass("span6");

    }else{
        $("#top_menu_list").css({"top":"50px"});
        $("#admin_menu").addClass("tabs-left");
        $("#add_new_menu").addClass("tabs-left");
        $("#status_column").css({"width":"10%"});
        $("#content").css({"width":"77%"});
        $("#event_search_box").addClass("offset2");
        $("#event_pagination").removeClass("span6");
        $("#event_pagination").addClass("span4");
    }
    //phone
    if ($(this).width() <= 480) {
        $("#top_menu_list").css({"top":"5px"});
        console.log("Phone settings");
        $("#event_details_content").css({"width":"100%"});
       // $("#s2id_tag_list").css({"width":"300px"});
        $("#submit_event_details").css({"margin-top":"0px"});
        $("#table_list").css({"padding":"0px"});
        $("#video_show").css({"width":"300px","height":"190px"});

    }else{
        $("#event_details_content").css({"width":"80%"});
        //$("#s2id_tag_list").css({"width":"400px"});
        $("#table_list").css({"padding":"20px"});
        $("#video_show").css({"width":"400px","height":"250px"});
        $("#top_menu_list").css({"top":"50px"});
    }
}

function showCompanyLogo(companyDetails){
    if(companyDetails.logoLink != null && companyDetails.logoLink.length > 0){
        var logo = '<input type="hidden" id="company_id" name="company_id" value="'+companyDetails.id+'" /><img src="'+serviceURLs.GET_COMPANY_LOGO+'/'+companyDetails.id+'" >';
        $("#company_select").html(logo);
    } else{
        $("#company_select").html('<input type="hidden" id="company_id" name="company_id" value="'+companyDetails.id+'" /><h4 style="color:#d9d9d9;margin-top:0px;margin-bottom: 20px;"">'+companyDetails.companyName+'</h4>');
    }
}
function showHeader(listId){
    $('#top-header').load(templates.PAGE_HEADER,function() {
        $("#user_name").html("Welcome "+$.session.get(session_keys.USER_NAME));
        $("#"+listId).addClass('active');
        //set company

        var companyList = jQuery.parseJSON($.session.get(session_keys.COMPANIES));
        if(companyList != undefined && companyList.length > 0){
            if(companyList.length == 1 ){
                ajaxGETRequest(serviceURLs.GET_COMPANY+"/"+companyList[0].id,showCompanyLogo);
            }else{
                var company_list = '<select style="width:140px;" id="company_id">';
                for(i=0;i<companyList.length;i++){
                    company_list += '<option value="'+companyList[i].id+'">'+companyList[i].companyName+'</option>';
                }
                $("#company_select").html(company_list);
            }

        }


       //All menu clicks
        if($.session.get(session_keys.USER_ROLE) == 'administrator'){
            $('#site_admin_button').show();
            //$("#top_nav").children(':first').before('<li id="site_admin_button"> <a href="#"> <i class="icon-wrench"></i> Site Administration</a></li>');
        }else{
            $('#site_admin_button').hide();
        }
        //home
        $("#home_button").click(function(){
            if(isFormChanged === true){
                var r=confirm(unSaveMessage);
                if (r==true){
                    showEventPage();
                    isFormChanged = false;
                }
            }else{
                showEventPage();
            }
        });

        //site admin
        $("#site_admin_button").click(function(){
            if(isFormChanged === true){
                var r=confirm(unSaveMessage);
                if (r==true){
                    showAdminControl();
                    isFormChanged = false;
                }
            }else{
                showAdminControl();
            }

        });

        $("#profile_button").click(function(){
            if(isFormChanged === true){
                var r=confirm(unSaveMessage);
                if (r==true){
                    showProfile();
                    isFormChanged = false;
                }
            }else{
                showProfile();
            }
        });
        //logout
        $("#logout").click(function(){
            if(isFormChanged === true){
                var r=confirm(unSaveMessage);
                if (r==true){
                    onLogout();
                    isFormChanged = false;
                }
            }else{
                onLogout();
            }
        });

        //window.onbeforeunload = checkUnchange();
       // $(window).bind('beforeunload', checkUnchange);
    });

   // $(window).bind('beforeunload', checkPrompt);
}
 function checkUnchange(){
     $(document).click(function(){});
     if(true){
         return "You have unsaved changes!.";
     }
 }

$.fn.observe = function( time, callback ){
    return this.each(function(){
        var form = this, change = false;
        $(form.elements).change(function(){
            change = true;
        });
        setInterval(function(){
            if ( change ) callback.call( form );
            change = false;
        }, time * 1000);
    });
};



