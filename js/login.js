var remember = 0;
function onLogout(){
    $.session.clear();
    $.session.delete(session_keys.IS_LOGGED_IN);
    $.removeCookie(cookieParams.IS_LOGGED);
    $.removeCookie(cookieParams.VM_SESS_ID);
    location.reload();
}

function login(){
    $('#content').load(templates.PAGE_LOGIN,function() {
        console.log("LOGIN PAGE LOADED ..");
        $('#top-header').load(templates.PAGE_LOGIN_HEADER,function() {});
        $("#login").click(function(){
            loginAction();
        });
        $("#forgot_password").click(function(){
           $("#forgotPassword").css({'display':'block'});
        });
        $('#loginForm').keypress(function(e) {
            if (e.keyCode == 13) {
                //Close dialog and/or submit here...
                loginAction();
            }
        });

        $("#forgot_password_submit").click(function (){
          if($("#userId").val() == ""){
              errorMessage("Please enter user id");

          }else{
              var request = '{"username":"'+$("#userId").val()+'"}';
              ajaxPOSTRequest(request, serviceURLs.FORGOT_PASSWORD,passwordReset);
          }

        });

    });
}

function passwordReset(data){
    if(data.status && data.status == 'failed'){
        errorMessage(data.reason);
    }else if(data.status == 'success'){
        $("#password_message").html('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">&times;</button>Your password has been reset and sent your email id.</div>');
        $("#userId").val("");
        $("#forgotPassword").hide();
    }

}
function loginAction(){
    console.log("LOGIN CLICKED ..");
    if($('#username').val() == "" || $('#password').val() == ""){

        $("#errorMessage").css({'display':'block'});
        $("#errorMessage").html("Please enter user id and password");
        return;
    }
    remember = $("#remember:checked").length;
    ajaxPostWithFromRequest('#loginForm',serviceURLs.GET_LOGIN,onLoginResult);
}
function onLoginResult(loginResponse){
    $("#errorMessage").css({'display':'none'});

    console.log("Login Response"+loginResponse.firstNam+" >> "+loginResponse.lastName+" >> "+loginResponse.role);
    if(loginResponse.status == 'failed'){
		$("#errorMessage").css({'display':'block'});
        $("#errorMessage").html(loginResponse.reason);
       
    }else{
        console.log("Login success");
        $.session.set(session_keys.IS_LOGGED_IN,true);
        $.session.set(session_keys.USER_ROLE,loginResponse.role);
        $.session.set(session_keys.USER_NAME,loginResponse.firstName+' '+loginResponse.lastName);
        $.session.set(session_keys.USER_ID,loginResponse.userId);
        $.session.set(session_keys.COMPANIES,JSON.stringify(loginResponse.companies));
        $.session.set(session_keys.ID,loginResponse.id);
        if(loginResponse.companies[0].referenceIDLabel!=null && loginResponse.companies[0].referenceIDLabel != ""){
            $.session.set(session_keys.REF_ID_LABEL,loginResponse.companies[0].referenceIDLabel);
        }else{
            $.session.set(session_keys.REF_ID_LABEL,"Reference Id");
        }

        //set cookies
        if(remember == 1){
            $.cookie(cookieParams.IS_LOGGED, true);
            console.log(">> session id"+$.session.get(session_keys.SESSION_ID));
            $.cookie(cookieParams.VM_SESS_ID, $.session.get(session_keys.SESSION_ID));
            $.cookie(session_keys.USER_ROLE,loginResponse.role);
            $.cookie(session_keys.USER_NAME,loginResponse.firstName+' '+loginResponse.lastName);
            $.cookie(session_keys.USER_ID,loginResponse.userId);
            $.cookie(session_keys.COMPANIES,JSON.stringify(loginResponse.companies));
            $.cookie(session_keys.ID,loginResponse.id);
            if(loginResponse.companies[0].referenceIDLabel!=null && loginResponse.companies[0].referenceIDLabel != ""){
                $.cookie(session_keys.REF_ID_LABEL,loginResponse.companies[0].referenceIDLabel);
            }else{
                $.cookie(session_keys.REF_ID_LABEL,"Reference Id");
            }

        }
        $("#ref_id_label").html($.session.get(session_keys.REF_ID_LABEL));
        showEventPage();
    }
}