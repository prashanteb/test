//local test
var baseURL = "http://localhost/vmobile/api/";

//dev box
//var baseURL = "http://198.61.183.9:8080/VMobileApplication/"

//Prod
//var baseURL = "http://ec2-54-215-241-150.us-west-1.compute.amazonaws.com/VMobileApplication/"

var unSaveMessage = "You have unsaved changes!\n Are sure you want to continue?";
var fileType = {
    MS_WORD : "word",
    MS_XLS : "sheet",
    VIDEO : "video",
    AUDIO : "audio",
    PDF : "pdf",
    IMAGE : "image"
};

var statusType = {
    SUCCESS : 'success',
    FAILED : 'failed'
}
var cookieParams = {
    "IS_LOGGED" : "is_logged",
    "VM_SESS_ID": "vm_sess_id"
}

var serviceURLs = {
	"GET_EVENT_LIST" : baseURL+"eventlist/",
    "GET_SEVENT_LIST" : baseURL+"seventlist/",
    "GET_LOGIN" : baseURL+"login/",
    "GET_USER"  : baseURL+"userslist",
    "GET_ACTIVE_USER"  : baseURL+"activeuserslist",
    "GET_COMPANY" : baseURL+"companylist",
    "PUT_CONTENT" : baseURL+"putAllContent",
    //"GET_CONTENT" : "http://198.61.183.9:8080/VMobileApplication/getContent",
    "GET_CONTENT" : baseURL+"getContent",
    "GET_TAGS" : baseURL+"tags",
    "MERGE_TAGS": baseURL+"mergeTags",
    "FORGOT_PASSWORD" : baseURL+"resetpassword",
    "AUDIT_LIST" : baseURL+"auditlist/eventslist/",
    "PUT_CONT_TAG" : baseURL+"putContentTag/",
    "PUT_COMPANY_LOGO" : baseURL+"putCompanyLogo/",
   // "GET_COMPANY_LOGO" : baseURL+"getCompanyLogo/"
    "GET_COMPANY_LOGO" : "http://198.61.183.9:8080/VMobileApplication/getCompanyLogo/"
};

var templates = {
	"PAGE_HEADER": "tpl/Header.html",
	"PAGE_HOME" : "tpl/EventList.html",
	"PAGE_EVENTS" : "",
	"PAGE_LOGIN" : "tpl/Login.html",
    "PAGE_LOGIN_HEADER" : "tpl/LoginHeader.html",
	"PAGE_PASSWORD" : "tpl/ForgotPassword.html",
    "PAGE_ADMIN_PANEL" : "tpl/AdminConsole.html",
    "PAGE_PROFILE" : "tpl/Profile.html",
    "PAGE_EVENT_DETAIL" : "tpl/EventDetails.html"
};

//proxy
//current pages

var current_page = {
    HOME_PAGE       : 'HOME_PAGE',
    ADMIN_PAGE      : 'ADMIN_PAGE',
    PROFILE_PAGE    : 'PROFILE_PAGE'
};


// session keys
var session_keys  = {
    IS_LOGGED_IN    : 'is_login',
    CURRENT_PAGE    : 'CURRENT_PAGE',
    SESSION_ID      : 'SESSION_ID',
    USER_ROLE       : 'USER_ROLE',
    USER_NAME       : 'USER_NAME',
    USER_ID         : 'USER_ID',
    COMPANIES       : 'COMPANIES',
    ID              : 'ID',
    REF_ID_LABEL    : 'REF_ID_LABEL',
    STATUS_FILTER   : 'STATUS_FILTER',
    EVENT_ROW_COUNT : 'event_rows_count'
};

var STATUS = {
    ALL : "ALL",
    OPEN : "open",
    CLOSE : "close"
};


//json request
function ajaxGETRequest(URL, successCallback){
    var sessid = $.session.get(session_keys.SESSION_ID);
    $.ajax({
        type:"GET",
        url: URL,
        cache: false,
        beforeSend: function(xhr){xhr.setRequestHeader('VMSessionId', sessid);},
        dataType:'json',
        contentType:"application/json",
        success: function(data,textStatus, request){
            if(data.status && data.status == 'failure' && data.reason == 'User session expired' ){
                sessionExpireModal();
            }
            successCallback(data);
        },
        error: function( jqXHR, textStatus, errorThrown){
        }
    });
}


function ajaxGETRequest1(URL, successCallback){
    var sessid = $.session.get(session_keys.SESSION_ID);
    $.ajax({
        type:"GET",
        url: URL,
        cache: false,
        beforeSend: function(xhr){xhr.setRequestHeader('VMSessionId', sessid);},
        dataType:'json',
        contentType:"application/json",
        success: function(data,textStatus,request){
            if(data.status && data.status == 'failure' && data.reason == 'User session expired' ){
                sessionExpireModal();
            }
            successCallback(data);
        },error: function( jqXHR, textStatus, errorThrown){
            successCallback(textStatus);
        }
    });
}

function ajaxCallWithRequest(request, URL, successCallback){
    var sessid = $.session.get(session_keys.SESSION_ID);
	$.ajax({
			type:"GET",
			url: URL,
            beforeSend: function(xhr){xhr.setRequestHeader('VMSessionId', sessid);},
			dataType:'json',
			data: request,
			contentType:"application/json",
            success: function(data,textStatus, request){
                if(data.status && data.staus == 'failure' && data.reason == 'User session expired'){
                    sessionExpireModal();
                }
                $("#spinner").hide();
                successCallback(data);
            }

	});
}

function ajaxPOSTRequest(request, URL, successCallback){
    var sessid = $.session.get(session_keys.SESSION_ID);
    $.ajax({
        type:"POST",
        url: URL,
        beforeSend: function(xhr){xhr.setRequestHeader('VMSessionId', sessid);},
        dataType:'json',
        data: request,
        contentType:"application/json",
        success: function(data,textStatus, request){
            if(data.status && data.status == 'failure' && data.reason == 'User session expired'){
                sessionExpireModal();
            }
            $("#spinner").hide();
            successCallback(data);
        }

    });
}

function sessionExpireModal(){
    var sessModal = '<div class="modal hide fade" id="sessModal">'+
        '<div class="modal-header">'+
        '<h3>Session Expired</h3></div>'+
        '<div class="modal-body"><p>Your session expired. Please login once again.</p></div>'+
        '<div class="modal-footer"><a href="#" class="btn" id="close_sess_modal">Close</a></div>';
    $('body').append(sessModal);
    $('#sessModal').modal({
        backdrop    : 'static',
        keyboard    : false
    });
    $("#close_sess_modal").click(function(){
           onLogout();
    })

}

function ajaxCallWithFromRequest(form_name,URL, successCallback){
	$.ajax({
		type: "GET",
		url: URL,
		dataType:'json',
		data: JSON.stringify($(form_name).serializeObject()),
		contentType:"application/json",
		success: successCallback
	  });
}

function ajaxPostWithFromRequest(form_name,URL, successCallback){

$.ajax({
		type: "POST",
		url: URL,
		dataType:'json',
		crossDomain: true,
		data: JSON.stringify($(form_name).serializeObject()),
		contentType:"application/json",
		success: function(data,textStatus, request){
            sessionID = request.getResponseHeader('VMSessionId');
            $.session.set(session_keys.SESSION_ID,sessionID);
            $("#spinner").hide();
            successCallback(data);
        }
	});
}

//get query string
jQuery.fn.serializeObject = function() {
  var arrayData, objectData;
  arrayData = this.serializeArray();
  objectData = {};

  $.each(arrayData, function() {
    var value;

    if (this.value != null) {
      value = this.value;
    } else {
      value = '';
    }

    if (objectData[this.name] != null) {
      if (!objectData[this.name].push) {
        objectData[this.name] = [objectData[this.name]];
      }

      objectData[this.name].push(value);
    } else {
      objectData[this.name] = value;
    }
  });

  return objectData;
};

//get query string
(function($) {
    $.QueryString = (function(a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p=a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'))
})(jQuery);


function camelCase(str) {
    return str.replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
}

function errorMessage(_message){
    $.pnotify({
        title: 'Error',
        text: _message,
        type: 'error'
    });
}

function successMessage(_message){
    $.pnotify({
        title: 'Success',
        text: _message,
        type: 'success'
    });
}

function failureMessage(_message){
    $.pnotify({
        title: 'Failure',
        text: _message,
        type: 'error'
    });
}


function loadRemoteImage(_url){
    console.log("loading remote image "+_url);
    var img = $("<img />").attr('src', _url)
        .load(function() {
            if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
                alert('broken image!');
            } else {
                return img;
            }
        });

}
