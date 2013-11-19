/**
 * Created with JetBrains WebStorm.
 * User: prashant.balikai
 * Date: 8/8/13
 * Time: 10:20 PM
 * To change this template use File | Settings | File Templates.
 */

function showProfile(){
    $.session.set(session_keys.CURRENT_PAGE,current_page.PROFILE_PAGE);

    showHeader("profile_button");

    $('#content').load(templates.PAGE_PROFILE,function() {
        ajaxGETRequest(serviceURLs.GET_USER+"/"+ $.session.get(session_keys.USER_ID),editProfile);
        $("#updateProfile").click(function(){
            saveProfile();

        });
        resizeSettings();

        $("#change_password").click(function(){
            var old_pass = $("#old_pass").val();
            var new_pass = $("#new_pass").val();
            var conf_pass = $("#conf_pass").val();
            if(old_pass == "" || new_pass == "" || conf_pass == "" ){
                errorMessage("All the fields are mandatory");
                return false;
            }
            if(old_pass == new_pass){
               errorMessage("New password should not be same as old password")
            } else if( new_pass != conf_pass ){
                 errorMessage("Confirmation password is not correct");
                 $("#conf_pass").focus();
             }else{
                if(!CheckPassword(conf_pass)){
                   errorMessage("Password must be 7 to 15 characters which contain at least one numeric digit and a special character");
                } else{
                    var request = '{"username":"'+$("#userId").val()+'"}';
                    var userid = $.session.get(session_keys.USER_ID);
                    var request = '{"username":"'+userid+'","password": "'+old_pass+'","newPassword" : "'+conf_pass+'"}';
                    ajaxPOSTRequest(request, serviceURLs.FORGOT_PASSWORD,changePasswordSuccess);

                }
             }
        });
    });
}


function changePasswordSuccess(data){
    console.log("change password "+data.status);
    if(data.status == statusType.SUCCESS){
        successMessage("Password changed successfully");
        $("#old_pass").val("");
        $("#new_pass").val("");
        $("#conf_pass").val("");
        loginRequestModal();
    } else if(data.status == statusType.FAILED){
        if(data.reason != ""){
            errorMessage(data.reason);
            $("#old_pass").val("");
            $("#old_pass").focus();

        } else{
            errorMessage("Change password is not successful. Please try once again");
        }

    }

}

function loginRequestModal(){
    var sessModal = '<div class="modal hide fade" id="sessModal">'+
        '<div class="modal-header">'+
        '<h3>Session Expired</h3></div>'+
        '<div class="modal-body"><p>Your password is changed. Please login once again.</p></div>'+
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

function CheckPassword(inputtxt)
{
    var paswd=  /^(?=.*[0-9])(?=.*[!@#$%^&_*])[a-zA-Z0-9!@#$%^&_*]{7,15}$/;
    if(inputtxt.match(paswd))
    {
        return true;
    }
    else
    {
        return false;
    }
}


function saveProfile(){

    profileObject.firstName = $("#firstName").val();
    profileObject.lastName =   $("#lastName").val();
    profileObject.phoneNumber = $("#phoneNumber").val();
    profileObject.email = $("#email").val();
    profileObject.address[0].addressLine1 = $("#address1").val();
    profileObject.address[0].addressLine2 = $("#address2").val();
    profileObject.address[0].city = $("#city").val();
    profileObject.address[0].state = $("#state").val();
    profileObject.address[0].zipCode = $("#zipCode").val();
    profileObject.address[0].country = $("#country").val();

    var updateUserRequest = JSON.stringify(profileObject);
    console.log(updateUserRequest);
    ajaxPOSTRequest(updateUserRequest,serviceURLs.GET_USER,userUpdateSuccess);
}

function userUpdateSuccess(updateResponse){
    if(updateResponse.status == "failure"){
        $.pnotify({
            title: 'Failure',
            text: updateResponse.reason,
            type: 'error'
        });
    }else{
        $.pnotify({
            title: 'Success',
            text: 'User data successfully saved',
            type: 'success'
        });
    }
}

function editProfile(memeberDetails){
    profileObject = memeberDetails;
    $("#firstName").val(memeberDetails.firstName);
    $("#lastName").val(memeberDetails.lastName);
    $("#phoneNumber").val(memeberDetails.phoneNumber);
    $("#email").val(memeberDetails.email);
    $("#mem_role").html(memeberDetails.role);
    if(memeberDetails.active == true){
        $("#isActive").html("Active");
    }else{
        $("#isActive").html("Inactive");
    }

    for(i=0;i<memeberDetails.address.length;i++){
        console.log(".>>"+memeberDetails.address[i].state);
        $("#address_id").val(memeberDetails.address[i]._id);
        $("#address1").val(memeberDetails.address[i].addressLine1);
        $("#address2").val(memeberDetails.address[i].addressLine2);
        $("#city").val(memeberDetails.address[i].city);
        $("#state").val(memeberDetails.address[i].state);
        $("#zipCode").val(memeberDetails.address[i].zipCode);
        $("#country").val(memeberDetails.address[i].country);
    }



}


