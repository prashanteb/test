function showAdminControl(){
    $.session.set(session_keys.CURRENT_PAGE,current_page.ADMIN_PAGE);
    showHeader("site_admin_button");

    $('#content').load(templates.PAGE_ADMIN_PANEL,function() {
        //$("#companyForm").FormObserve();
        /*$("#companyForm").formSavior({
            'msg' : 'Company information changes have not been saved.'
        }); */
        var sessid = $.session.get(session_keys.SESSION_ID);
        $("#member_details").css({'display':'none'});
        ajaxGETRequest(serviceURLs.GET_USER,manageMembers);
        $("#companyForm :input").change(function() {
            isFormChanged = true;
        });
        $("#memberForm :input").change(function() {
            isFormChanged = true;
        });

        $("#submitCompanyDetails").click(function(){
            var validation_fields = ["companyName","referenceIDLabel","address1","city","state","zipCode","country"];
            if(validateAdminForm(validation_fields)){
                updateCompanyDetails();
            }else{
                errorMessage("Please fill mandatory fields");
            }

        });

        $("#submitMember").click(function(){
            var validation_member_fields = ["firstName","lastName","phoneNumber","email"];
            if(validateAdminForm(validation_member_fields)){
                updateMemberDetails();
            }else{
                errorMessage("Please fill mandatory fields")
            }

        });

        $("#submitNewMember").click(function(){
            var validation_member_fields = ["firstName1","lastName1","phoneNumber1","email1","userid"];
            if(validateAdminForm(validation_member_fields)){
                addNewMembers();
            }else{
                errorMessage("Please fill mandatory fields")
            }

        });
        $("#phoneNumber").click(function(){
            $("#phoneNumber").val("");
        });
        //load tags
        ajaxGETRequest(serviceURLs.GET_TAGS,showTags);

        resizeSettings();
        member_status_filter = "All";
        $("#member_status > button.btn").on("click", function(){
            member_status_filter = this.innerHTML;
            console.log(member_status_filter);
            ajaxGETRequest(serviceURLs.GET_USER,manageMembers);
        });


        //upload logo


        $('#logo_upload').fileupload({
            dataType: 'json',
            singleFileUploads: true,
            beforeSend: function(xhr){xhr.setRequestHeader('VMSessionId', sessid);},
            add: function (e, data) {
                $.each(data.files, function (index, file) {
                    console.log('Added file: ' + file.name);
                    file_name = file.name;

                });
                var comp_id = $("#company_id").val();
                console.log(">>> comp_id 2>>>>>>"+$("#company_id").val());
                data.url = serviceURLs.PUT_COMPANY_LOGO+"/"+comp_id;
                var jqXHR = data.submit()
                    .success(function (result, textStatus, jqXHR) {
                        // response = jQuery.parseJSON(result.responseText);
                        console.log("success "+result);
                        uploadLogoSuccess(result);
                    })
                    .error(function (jqXHR, textStatus, errorThrown) {/* ... */})
                    .complete(function (result, textStatus, jqXHR) {

                        //response = jQuery.parseJSON(result.responseText);
                        response  = result.responseText;
                        console.log("complete "+response);
                        uploadLogoSuccess(response);

                    });
            },
            send: function (e, data) {
                notice = $.pnotify({
                    title: "Logo uploading...",
                    type: 'info',
                    icon: 'picon picon-throbber',
                    hide: false,
                    closer: false,
                    sticker: false,
                    opacity: .75,
                    shadow: false,
                    width: $.pnotify.defaults.width
                });
            },
            progressall: function (e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                if(progress > 2){
                    $('#file_upload_div').modal('hide');
                }
                if(progress >= 100){
                    setTimeout(function() {
                        notice.pnotify({
                            title: "Content upload done!",
                            type: "success",
                            hide: true,
                            closer: true,
                            sticker: true,
                            icon : 'picon picon-task-complete',
                            opacity : 1,
                            shadow : true,
                            text :"Logo is uploaded successfully",
                            width : $.pnotify.defaults.width
                        });}, 1000);
                }else{
                    notice.pnotify({
                        text:"Progress : "+progress+" %"
                    });
                }
            }
        }).prop('disabled', !$.support.fileInput)
            .parent().addClass($.support.fileInput ? undefined : 'disabled');
    });
}


function uploadLogoSuccess(data){
    var logo = '<img  class="peopleCarouselImg" style="max-height: 100px; max-width:200px;" src="'+serviceURLs.GET_COMPANY_LOGO+'/'+$("#company_id").val()+'" >';
    var logo_top = '<input type="hidden" id="company_id" name="company_id" value="'+$("#company_id").val()+'" /><img  src="'+serviceURLs.GET_COMPANY_LOGO+'/'+$("#company_id").val()+'" >'
    $("#image_logo_display").html(logo);
    $("#company_select").html(logo_top);

}

function manageMembers(userList){
    console.log("Load members");
    $("#user_list ul").empty();
    for(i=0;i<userList.userlist.length;i++){
        if((member_status_filter == "All") || (member_status_filter == "Active" && userList.userlist[i].active == true) || (member_status_filter == "Inactive" && userList.userlist[i].active == false) ){

            $("#user_list ul").append('<li class="userlist" id="'+userList.userlist[i].userID+'"><a href="#"><i class="icon-chevron-right"></i>'+camelCase(userList.userlist[i].lastName+', '+userList.userlist[i].firstName)+'</a></li>');

        }
    }
    $(".userlist").click(function(){
        var userid = $(this).attr('id');
        ajaxGETRequest(serviceURLs.GET_USER+"/"+userid,editMember);
    });

    //get current company detail
    var comp_id = $("#company_id").val();
    console.log(">>>> company id >>"+comp_id);
    ajaxGETRequest(serviceURLs.GET_COMPANY+"/"+comp_id,editCompany);

}


function addNewMembers(){
    var reqObject = '{"userID":"'+$("#userid1").val()+'","firstName":"'+$("#firstName1").val()+'","lastName":"'+$("#lastName1").val()+'","password":"","email":"'+$("#email1").val()+'","role":"'+$("#mem_role1").val()+
        '", "active":true, "address" : null,"companies":["'+$("#company_id").val()+'"],"deleted" : false}';
    console.log("New Member request "+reqObject);
    ajaxPOSTRequest(reqObject,serviceURLs.GET_USER,addNewMemberSuccess);
}

function addNewMemberSuccess(){
    successMessage("New member is added");
    $('#newMemberForm')[0].reset();
    ajaxGETRequest(serviceURLs.GET_USER,manageMembers);
    $("#newMemberModal").modal('hide');
}

function updateMemberDetails(){

        var actVal = $('#isActive > .btn.active').html();
        userObject.role = $("#mem_role").val();
        userObject.firstName = $("#firstName").val();
        userObject.lastName =   $("#lastName").val();
        userObject.phoneNumber = $("#phoneNumber").val();
        userObject.email = $("#email").val();
        var eventList = $("#events").val();
        console.log("event list "+eventList);
        if(eventList != null && eventList.length > 0){
            var events= new Array();
            for(i=0;i<eventList.length;i++){
                events.push({id:eventList[i]});
                /*if(eventList.length -1 != i){
                 events +=",";
                 } */

            }
            userObject.events = $("#events").val();
        }

        userObject.active = false;
        if($.trim(actVal) == 'ON'){
            userObject.active = true;
        }else{
            userObject.active = false;
        }

        var updateUserRequest =JSON.stringify(userObject);
        ajaxPOSTRequest(updateUserRequest,serviceURLs.GET_USER,editUserUpdateSuccess);
}


function editUserUpdateSuccess(updateResponse){
    console.log("updateResponse >> "+updateResponse);
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
          ajaxGETRequest(serviceURLs.GET_USER,manageMembers);
      }
}

function editCompany(companyDetails){

    $("#company_id").val(companyDetails.id);
    $("#companyName").val(companyDetails.companyName);
    $("#referenceIDLabel").val(companyDetails.referenceIDLabel);
    //$("#logoType").val(companyDetails.logoType);
    $("#logoLink").val(companyDetails.logoLink);
    if(companyDetails.address != null){
        for(i=0;i<companyDetails.address.length;i++){
            $("#address_id").val(companyDetails.address[i]._id);
            $("#address1").val(companyDetails.address[i].addressLine1);
            $("#address2").val(companyDetails.address[i].addressLine2);
            $("#city").val(companyDetails.address[i].city);
            $("#state").val(companyDetails.address[i].state);
            $("#zipCode").val(companyDetails.address[i].zipCode);
            console.log("> "+companyDetails.address[i].country);
            $("#country").val(companyDetails.address[i].country);
        }
    }


    if(companyDetails.logoLink != null && companyDetails.logoLink.length > 0){
        console.log("company id"+$("#company_id").val());
        var logo = '<img  class="peopleCarouselImg" style="max-height: 100px; max-width:200px;" src="'+serviceURLs.GET_COMPANY_LOGO+'/'+$("#company_id").val()+'" >';

        $("#image_logo_display").html(logo);

    }
}

function updateCompanyDetails(){
    //alert($("#address_id").val());
    var updateCompanyRequest = '{"id":"'+$("#company_id").val()+'","companyName":"'+$("#companyName").val()+'","logoType":"","logoLink": "'+
        $("#logoLink").val()+'","referenceIDLabel":"'+$("#referenceIDLabel").val()+'","address": [{"_id":"'+$("#address_id").val()+'","addressLine1": "'+$("#address1").val()
        +'","addressLine2": "'+$("#address2").val()+'","city":"'+$("#city").val()+'","state": "'+$("#state").val()+'","zipCode":"'+$("#zipCode").val()+
        '","country":"'+$("#country").val()+'"}]}';
    isFormChanged = false;
    ajaxPOSTRequest(updateCompanyRequest,serviceURLs.GET_COMPANY,companyUpdateSuccess);
}

function companyUpdateSuccess(updateResponse){
    if(updateResponse.status == "failure"){
        $.pnotify({
            title: 'Failure',
            text: updateResponse.reason,
            type: 'error'
        });
    }else{
        $.pnotify({
            title: 'Success',
            text: 'Company data successfully saved',
            type: 'success'
        });
    }
}

function editMember(memeberDetails){
    userObject = memeberDetails;
    $("#member_details").css({'display':'block'});
    console.log(memeberDetails.firstName);
    $("#firstName").val(memeberDetails.firstName);
    $("#lastName").val(memeberDetails.lastName);
    $("#phoneNumber").val(memeberDetails.phoneNumber);
    $("#email").val(memeberDetails.email);
    $("#mem_role").val(memeberDetails.role);
    if(memeberDetails.active == true){
        $("#activeButton").addClass('active');
        $("#inactiveButton").removeClass('active');
    }else{
        $("#activeButton").removeClass('active');
        $("#inactiveButton").addClass('active');
    }

    //hidden parameters
    $("#userid").val(memeberDetails.userID);
    $("#member_id").val(memeberDetails._id);
    $("#password").val(memeberDetails.password);

    ajaxGETRequest(serviceURLs.GET_EVENT_LIST,getEventList);

}

function getEventList(eventList){

    var events = eventList['eventlist'];
    eventListOption = '<select id="events" name="events" multiple="multiple">';
    for(i=0;i<events.length;i++){
        eventListOption += '<option value="'+events[i]._id+'">'+events[i].eventName+'</option>';
    }
    eventListOption += "</select>";
    $("#eventList").html(eventListOption);
    $("#events").val(userObject.events);
}

function updateProfile(){
    userObject = memeberDetails;
    $("#member_details").css({'display':'block'});
    $("#firstName").val(memeberDetails.firstName);
    $("#lastName").val(memeberDetails.lastName);
    $("#phoneNumber").val(memeberDetails.phoneNumber);
    $("#email").val(memeberDetails.email);
    $("#mem_role").val(memeberDetails.role);
    if(memeberDetails.active == true){
        $("#activeButton").addClass('active');
        $("#inactiveButton").removeClass('active');
    }else{
        $("#activeButton").removeClass('active');
        $("#inactiveButton").addClass('active');
    }

    //hidden parameters
    $("#userid").val(memeberDetails.userID);
    $("#member_id").val(memeberDetails._id);
    $("#password").val(memeberDetails.password);
    ajaxPOSTRequest(updateUserRequest,serviceURLs.GET_USER,userUpdateSuccess);
}


function showTags(tagList){
    $("#toMergeEventTags").hide();
    $("#toMergeContentTags").hide();
    if(tagList != null && tagList.length > 0){
        $("#event_tags").empty();
        $("#content_tags").empty();
        for(i=0;i<tagList.length;i++){
            if(tagList[i].tagType == 0){
                $("#event_tags").append('<option value="'+tagList[i].id+'">'+tagList[i].tagName+'</option>');
            }else if(tagList[i].tagType == 1){
                $("#content_tags").append('<option value="'+tagList[i].id+'">'+tagList[i].tagName+'</option>');
            }
        }

        $("#mergeEventTags").click(function(){
            if($("#event_tags").val() && $("#event_tags").val().length > 0){
                $("#mergeEventTags").addClass('disabled');
                $("#mergeEventTags").attr('disabled', 'disabled');
                var selectedEventTags = $("#event_tags").val();
                $("#event_tags_filter").empty();
                $("#event_tags_filter").append('<option value="" selected>Select tag to merge</option>');
                for(i=0;i<tagList.length;i++){
                    if(tagList[i].tagType == 0 && !($.inArray(tagList[i].id,selectedEventTags) > -1)){
                        $("#event_tags_filter").append('<option value="'+tagList[i].id+'">'+tagList[i].tagName+'</option>');
                    }
                }
                $("#toMergeEventTags").show();
            }else{
                //show alert
                errorMessage("Please select event tags to merge");
            }
        });
        $("#event_tags").change(function(){
            console.log("changed select");
            $("#toMergeEventTags").hide();
            $("#mergeEventTags").removeAttr('disabled');
            $("#mergeEventTags").removeClass('disabled');

        });


        //content tags
        $("#mergeContentTags").click(function(){
            if($("#content_tags").val() && $("#content_tags").val().length > 0){
                $("#mergeContentTags").addClass('disabled');
                $("#mergeContentTags").attr('disabled', 'disabled');
                var selectedContentTags = $("#content_tags").val();
                console.log(selectedContentTags);
                $("#content_tags_filter").empty();
                $("#content_tags_filter").append('<option value="" selected>Select tag to merge</option>');
                for(i=0;i<tagList.length;i++){
                    if(tagList[i].tagType == 1 && !($.inArray(tagList[i].id,selectedContentTags) > -1)){
                        $("#content_tags_filter").append('<option value="'+tagList[i].id+'">'+tagList[i].tagName+'</option>');
                    }
                }
                $("#toMergeContentTags").show();
            }else{
                //show alert
                errorMessage("Please select content tags to merge");
            }
        });
        $("#content_tags").change(function(){
            console.log("changed select");
            $("#toMergeContentTags").hide();
            $("#mergeContentTags").removeAttr('disabled');
            $("#mergeContentTags").removeClass('disabled');

        });

        $("#submitContentTags").click(function(){
            var mergeToTags = $("#content_tags_filter").val();
            if(mergeToTags != ""){
                var request = '{"srcTags":'+JSON.stringify($("#content_tags").val())+',"destTag":"'+mergeToTags+'"}';
                console.log("request "+request);
                ajaxPOSTRequest(request,serviceURLs.MERGE_TAGS,mergeSuccess);
            } else{
                errorMessage("Please select tag to merge");
            }



        });

        $("#submitEventTags").click(function(){
            var mergeToTags = $("#event_tags_filter").val();
            if(mergeToTags != ""){
                var request = '{"srcTags":'+JSON.stringify($("#event_tags").val())+',"destTag":"'+mergeToTags+'"}';
                console.log("request "+request);
                ajaxPOSTRequest(request,serviceURLs.MERGE_TAGS,mergeSuccess);
            }else{
                errorMessage("Please select tag to merge");
            }

            });
    }

}

function mergeSuccess(data){
    successMessage("Tags merged successfully");
    ajaxGETRequest(serviceURLs.GET_TAGS,showTags);
}




function  validateAdminForm(validation_fields){
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
        $("#errorMessage").css({'display':'none'});
        return true;
    }else{
        $("#errorMessage").css({'display':'block'});
        return false;
    }
}