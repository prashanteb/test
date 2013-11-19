var updateChangeList="";
var eventID;
function showEventDetails(_eventID){
    eventID = _eventID;
    var notice;
    var file_name;
    var percent = 0;
    var response;
    var sessid = $.session.get(session_keys.SESSION_ID);

    $('#content').load(templates.PAGE_EVENT_DETAIL,function() {
        ajaxGETRequest(serviceURLs.GET_EVENT_LIST+_eventID,showEvent);
        $("#ref_id_label").html($.session.get(session_keys.REF_ID_LABEL));
        $("#file_upload_div").hide();
        var $tabs = $('#add_event_tab.tabbable li');
        $('#prevtab').on('click', function() {
            $tabs.filter('.active').prev('li').find('a[data-toggle="tab"]').tab('show');
        });

        $('#nexttab').on('click', function() {
            $tabs.filter('.active').next('li').find('a[data-toggle="tab"]').tab('show');
        });

        $("#updateEvent").click(function(){
            updateEventDetails();
        });
        $("#uploadContent").click(function(){
              $("#file_upload_div").show();
        });
        $("#member_list").select2();

        $("#tag_list").select2();
        ajaxGETRequest(serviceURLs.GET_TAGS,showContentTags);

        $("#content_tag_list").select2();
        $("#content_edit_tag_list").select2();
        $("#cancel_upload").click(function(){
            //$("#file_upload_div").hide();
            $('#file_upload_div').modal('hide');
        });
        $('#fileupload').fileupload({
            dataType: 'json',
            singleFileUploads: true,
            beforeSend: function(xhr){xhr.setRequestHeader('VMSessionId', sessid);},
            add: function (e, data) {
                $.each(data.files, function (index, file) {
                    console.log('Added file: ' + file.name);
                    file_name = file.name;

                });
                data.url = getContentTags(_eventID);
                var jqXHR = data.submit()
                    .success(function (result, textStatus, jqXHR) {
                        // response = jQuery.parseJSON(result.responseText);
                        console.log("success "+result);
                        uploadContentSuccess(result);
                    })
                    .error(function (jqXHR, textStatus, errorThrown) {/* ... */})
                    .complete(function (result, textStatus, jqXHR) {

                        //response = jQuery.parseJSON(result.responseText);
                        response  = result.responseText;
                        console.log("complete "+response);
                        uploadContentSuccess(response);

                    });
            },
            send: function (e, data) {
                notice = $.pnotify({
                    title: "Content uploading...",
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
                            text :"Content is uploaded successfully",
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
        //add new tag
        $("#addNewTag").click(function(){
            if($("#newTagVal").val() != ""){
                var newTagReq = '{ "tagName" : "'+$("#newTagVal").val()+'" , "tagType": "0"}';
                ajaxPOSTRequest(newTagReq,serviceURLs.GET_TAGS,addTagSuccess);
            }else{
                errorMessage("Tag name should not be blank");

            }

        });

        $("#addNewContentTag").click(function(){
            if($("#newContentTagVal").val() != ""){
                var newTagReq = '{ "tagName" : "'+$("#newContentTagVal").val()+'" , "tagType": "1"}';
                ajaxPOSTRequest(newTagReq,serviceURLs.GET_TAGS,addContentTagSuccess);
            }else{
                errorMessage("Tag name should not be blank");

            }

        });
        $("#addNewContentTag1").click(function(){
            if($("#newContentTagVal1").val() != ""){
                var newTagReq = '{ "tagName" : "'+$("#newContentTagVal1").val()+'" , "tagType": "1"}';
                ajaxPOSTRequest(newTagReq,serviceURLs.GET_TAGS,addContentTagSuccess1);
            }else{
                errorMessage("Tag name should not be blank");

            }
        });

        $("#save_content_details").click(function(){
            updateContent();
        });
        //load audit list
        ajaxGETRequest(serviceURLs.AUDIT_LIST+_eventID,showAuditList);

        resizeSettings();

        $("#event_details :input").change(function() {
            updateChangeList +="UPDATE_DETAILS,";
            isFormChanged = true;
        });

        $("#event_address :input").change(function() {
            updateChangeList +="UPDATE_ADDRESS,";
            isFormChanged = true;
        });

        $("#event_members :input").change(function() {
            updateChangeList +="UPDATE_MEMBERS,";
            isFormChanged = true;
        });

        $("#event_tags :input").change(function() {
            updateChangeList +="UPDATE_TAGS,";
            isFormChanged = true;
        });
    });
}

function updateContent(){
    var content_id = $("#content_id").val();
    var contentTagList = $("#content_edit_tag_list").val();
    if(contentTagList != null && contentTagList.length > 0 ){
        console.log(content_id+"cont tags >>>"+contentTagList);
        ajaxGETRequest(serviceURLs.PUT_CONT_TAG+content_id+'?tags='+contentTagList,contentTagSuccess);
    }else{
         errorMessage("No tags are selected");
    }


}

function contentTagSuccess(data){
    console.log("content id"+data.id);
    setContent(data);
   successMessage("Content is updated");
    $('#file_upload_div').modal('hide');
    //showContentTags(data.tags);
    $("#content_edit_tag_list").select2("val",data.tags);
}
function setContent(data){
      for(i=0;i<eventDetail.contents.length;i++){
          if(eventDetail.contents[i].id == data.id){
              eventDetail.contents[i].tags = data.tags;
          }
      }
}
function showContentTags(tagList){
    if(tagList != null && tagList.length > 0){
        $("#content_tag_list").empty();
        $("#content_edit_tag_list").empty();
        for(i=0;i<tagList.length;i++){
            if(tagList[i].tagType == 1){
                $("#content_tag_list").append('<option value="'+tagList[i].id+'">'+tagList[i].tagName+'</option>');
                $("#content_edit_tag_list").append('<option value="'+tagList[i].id+'">'+tagList[i].tagName+'</option>');
            }
        }
    }
}
function getContentTags(_eventID){
    console.log("get content tags ");
    var url = serviceURLs.PUT_CONTENT+"/"+_eventID;
    if($("#content_tag_list").select2("val")!= ""){
        return url+"?tags="+$("#content_tag_list").select2("val");
    } else{
        return url;
    }

}
function addTagSuccess(tagResponse){
    console.log("after tag add "+tagResponse.id);
    if(tagResponse != null && tagResponse.id != ""){
        successMessage('New tag added');
        $("#tag_list").prepend('<option value="'+tagResponse.id+'">'+tagResponse.tagName+'</option>');
        var selectedItems = $("#tag_list").select2("val");
        selectedItems.push(tagResponse.id);
        $("#tag_list").select2("val", selectedItems);
        $("#newTagVal").val("");
    }
}


function addContentTagSuccess1(tagResponse){
    if(tagResponse != null && tagResponse.id != ""){
        successMessage('New tag added');
        $("#content_edit_tag_list").prepend('<option value="'+tagResponse.id+'">'+tagResponse.tagName+'</option>');
        var selectedItems = $("#content_edit_tag_list").select2("val");
        selectedItems.push(tagResponse.id);
        $("#content_edit_tag_list").select2("val", selectedItems);
        $("#newContentTagVal1").val("");
    }
}

function addContentTagSuccess(tagResponse){
    console.log("after tag add "+tagResponse.id);
    if(tagResponse != null && tagResponse.id != ""){

        successMessage('New tag added');
        $("#content_tag_list").prepend('<option value="'+tagResponse.id+'">'+tagResponse.tagName+'</option>');
        $("#newContentTagVal").val("");
    }
}
function uploadContentSuccess(data){
    //eventDetail = data;
    ajaxGETRequest(serviceURLs.GET_EVENT_LIST+eventID,showEvent);
    //console.log("load content "+JSON.parse(data.contents));
    //loadCarousel(eventDetail);
}


function loadCarousel(data){
   //data = jQuery.parseJSON(data);

    //$("#carousel_list").html("<center><strong>Loading content ...</strong></center>");
        var allHTML = "";
        var videoHTML = "";
        var audioHTML = "";
        var imagesHTML = "";
        var docsHTML = "";

        var allCount = 0;
        var imgCount = 0;
        var vidCount = 0;
        var audioCount = 0;
        var docCount = 0;

    if(data.contents != null && data.contents.length > 0 ){
        for(i=0;i<data.contents.length;i++){
            console.log("loading content "+data.contents[i]);
            var contType = data.contents[i].contentType;
            //image
            if(contType != undefined ){
                allCount++;
                var htmlData = "";
                if( contType.indexOf(fileType.IMAGE) >= 0){
                    imgCount++;
                    htmlData = '<a href="#" class="showContents" data-id="'+data.contents[i].id+'" data-url="'+serviceURLs.GET_CONTENT+'/'+data.contents[i].id+'" data-type="'+fileType.IMAGE+'" ><img  class="peopleCarouselImg" src="'+serviceURLs.GET_CONTENT+'/'+data.contents[i].id+'" ></a>';
                    allHTML += htmlData;
                    imagesHTML += htmlData;
                }else if(contType.indexOf(fileType.VIDEO) >= 0 ){
                    vidCount++;
                    htmlData = '<a href="#" class="showContents" data-id="'+data.contents[i].id+'" data-url="'+serviceURLs.GET_CONTENT+'/'+data.contents[i].id+'"  data-type="'+fileType.VIDEO+'" ><img  class="peopleCarouselImg" src="images/video_player.png" ></a>';
                    allHTML += htmlData;
                    videoHTML += htmlData;
                }else if(contType.indexOf(fileType.AUDIO) >= 0){
                    audioCount++;
                    htmlData = '<a href="#" class="showContents" data-id="'+data.contents[i].id+'" data-url="'+serviceURLs.GET_CONTENT+'/'+data.contents[i].id+'"  data-type="'+fileType.AUDIO+'" ><img  class="peopleCarouselImg" src="images/audio-file.png" ></a>';
                    allHTML += htmlData;
                    audioHTML += htmlData;
                }else if(contType.indexOf(fileType.MS_WORD) >= 0){
                    docCount++;
                    htmlData = '<a href="#" class="showContents" data-id="'+data.contents[i].id+'" data-url="'+serviceURLs.GET_CONTENT+'/'+data.contents[i].id+'"  data-type="'+fileType.MS_WORD+'" ><img  class="peopleCarouselImg" src="images/docs.png" ></a>';
                    allHTML += htmlData;
                    docsHTML += htmlData;
                }else if(contType.indexOf(fileType.MS_XLS) >= 0){
                    docCount++;
                    htmlData = '<a href="#" class="showContents" data-id="'+data.contents[i].id+'" data-url="'+serviceURLs.GET_CONTENT+'/'+data.contents[i].id+'"  data-type="'+fileType.MS_XLS+'" ><img  class="peopleCarouselImg" src="images/xls.png" ></a>';
                    allHTML += htmlData;
                    docsHTML += htmlData;
                }else if(contType.indexOf(fileType.PDF) >= 0){
                    console.log("pdf file");
                    docCount++;
                    htmlData += '<a href="#" class="showContents" data-id="'+data.contents[i].id+'" data-url="'+serviceURLs.GET_CONTENT+'/'+data.contents[i].id+'" data-type="'+fileType.PDF+'" ><img  class="peopleCarouselImg" src="images/pdf.png"></a>';
                    allHTML += htmlData;
                    docsHTML += htmlData;
                }
            }
        }
        if(allCount == 0)
            allHTML = "<center><strong>No content found for this event</strong></center>";
        if(vidCount == 0)
            videoHTML = "<center><strong>No video content found for this event</strong></center>";
        if(audioCount == 0)
            audioHTML = "<center><strong>No audio content found for this event</strong></center>";
        if(imgCount == 0)
            imagesHTML = "<center><strong>No images found for this event</strong></center>";
        if(docCount == 0)
            docsHTML = "<center><strong>No documents found for this event</strong></center>";

        //console.log('html '+carouselHTML);
        $("#allHTML").html(allHTML);
        $("#allImages").html(imagesHTML);
        $("#allVideo").html(videoHTML);
        $("#allAudio").html(audioHTML);
        $("#allDocs").html(docsHTML);
        $("#allCount").html(allCount);
        $("#imgCount").html(imgCount);
        $("#vidCount").html(vidCount);
        $("#audioCount").html(audioCount);
        $("#docCount").html(docCount);

        console.log("No content");
        //$("#myCarousel").html("<center><strong>No content found for this event</strong></center>");


    }else{
        if(allCount == 0)
            allHTML = "<center><strong>No content found for this event</strong></center>";
        if(vidCount == 0)
            videoHTML = "<center><strong>No video content found for this event</strong></center>";
        if(audioCount == 0)
            audioHTML = "<center><strong>No audio content found for this event</strong></center>";
        if(imgCount == 0)
            imagesHTML = "<center><strong>No images found for this event</strong></center>";
        if(docCount == 0)
            docsHTML = "<center><strong>No documents found for this event</strong></center>";

        //console.log('html '+carouselHTML);
        $("#allHTML").html(allHTML);
        $("#allImages").html(imagesHTML);
        $("#allVideo").html(videoHTML);
        $("#allAudio").html(audioHTML);
        $("#allDocs").html(docsHTML);
        $("#allCount").html(allCount);
        $("#imgCount").html(imgCount);
        $("#vidCount").html(vidCount);
        $("#audioCount").html(audioCount);
        $("#docCount").html(docCount);

    }

    $(".showContents").click(function(){

        var data_url = $(this).data("url");
        var data_type = $(this).data("type");
        var data_id = $(this).data("id");
        $("#content_id").val(data_id);
        $("#showContentModal").modal();
        $("#content_show").html("");
        if(data_type==fileType.IMAGE){
            $("#content_show").html('<a href="'+data_url+'" data-lightbox="image"><img src="'+data_url+'" class="img-polaroid content_show_window"></a>');
        }else if(data_type==fileType.VIDEO){
            $("#content_show").html('<div class="videoUiWrapper thumbnail"><video width="400" height="250" id="video_show"><source src="'+data_url+'" type="video/ogg">Your browser does not support the video tag.</video></div>');
            $('#video_show').videoUI({'autoHide':false,autoPlay:true});
        }else if(data_type==fileType.AUDIO){
            $("#content_show").html('<audio controls><source src="'+data_url+'" type="audio/mpeg" /></audio>');
        }else if(data_type==fileType.PDF || data_type==fileType.MS_WORD || data_type == fileType.MS_XLS){
            //$("#content_show").html('<a class="media" href="'+data_url+'" />');
            console.log("data_url >> "+data_url);
            $("#content_show").html('<iframe src="http://docs.google.com/viewer?url='+data_url+'&embedded=true" class="span12" style="border: none; height:400px;"></iframe>');
        }
        if(setContentTags(data_id) != null && setContentTags(data_id).length > 0){
            $("#content_edit_tag_list").select2("val",setContentTags(data_id));
        } else{
            $("#content_edit_tag_list").select2("val","");
        }

    });
}

function setContentTags(_contentID){
    console.log("set Content tags");
   var data =  eventDetail;
    if(data.contents != null && data.contents.length > 0 ){
        for(i=0;i<data.contents.length;i++){
             if(data.contents[i].id == _contentID){
                 console.log("found Content tags"+data.contents[i].tags);
                 return data.contents[i].tags;
             }
        }
    }

}

function showTagList(tagList){
    console.log("loading tags "+tagList.length);
    for(i=0;i<tagList.length;i++){
        if(tagList[i].tagType == 0){
            $("#tag_list").append('<option value="'+tagList[i].id+'">'+tagList[i].tagName+'</option>');
        }

    }

    if(eventDetail.tags != null && eventDetail.tags.length > 0 ){
        $("#tag_list").select2("val",eventDetail.tags);
    }
}
function showMemberList(userList){
    console.log("loading members"+userList.userlist.length);

    for(i=0;i<userList.userlist.length;i++){

        $("#member_list").append('<option value="'+userList.userlist[i]._id+'">'+camelCase(userList.userlist[i].lastName+', '+userList.userlist[i].firstName)+'</option>');
    }
    if(eventDetail.members != null && eventDetail.members.length > 0){
        $("#member_list").select2("val",eventDetail.members);
    }
}



function updateEventDetails(){
    var validation_fields = ["eventName","address1","address2","city","state","zipCode","country"];

    var event_fields = ["eventName"];
    var event_address = ["addressLine1","city","state","zipCode","country"];
    var ret = true;
    var message = "Please enter mandatory fields from below tabs";

    $("#event_details_tab").css({"color":"#696969"});
    $("#event_location_tab").css({"color":"#696969"});

    if(!validateEventForm(event_fields)){
        ret = false;
        message += "<li>Event details</li>";
        $("#event_details_tab").css({"color":"#FC0000"});
    }
    if(!validateEventForm(event_address)){
        message += "<li>Event Location</li>";
        $("#event_location_tab").css({"color":"#FC0000"});
        ret = false;
    }

    if(ret == false){
        errorMessage(message);
        return false;
    }

        eventDetail.eventName = $("#eventName").val();
        eventDetail.eventDetails = $("#eventDetails").val();
        if(eventDetail.address != null && eventDetail.address.length > 0){
            console.log("length "+eventDetail.address.length);
            eventDetail.address[0].addressLine1 = $("#addressLine1").val();
            eventDetail.address[0].addressLine2 = $("#addressLine2").val();
            eventDetail.address[0].city  = $("#city").val();
            eventDetail.address[0].state =  $("#state").val();
            eventDetail.address[0].zipCode = $("#zipCode").val();
            eventDetail.address[0].country = $("#country").val();
        }else{
            var addressArray = jQuery.parseJSON('[{"addressLine1":"'+$("#addressLine1").val()+'","addressLine2":"'+$("#addressLine2").val()+'","city":"'+$("#city").val()+'","state":"'+$("#state").val()+'","zipCode":"'+$("#zipCode").val()+'","country":"'+$("#country").val()+'"}]');
            eventDetail.address = addressArray;
        }
        eventDetail.members = $("#member_list").select2("val");
        eventDetail.tags = $("#tag_list").select2("val");
        var actVal = $('#isActive > .btn.active').html();
        if($.trim(actVal).toLowerCase() == "close"){
            eventDetail.status = "closed";
        }else{
            eventDetail.status = $.trim(actVal).toLowerCase();
        }

        eventDetail.referenceId = $("#referenceId").val();
        console.log(JSON.stringify(eventDetail));
        updateChangeList = updateChangeList.substring(0, updateChangeList.length - 1);
        isFormChanged=false;
        ajaxPOSTRequest(JSON.stringify(eventDetail),serviceURLs.GET_EVENT_LIST+"?operation="+updateChangeList,updateEventSuccess);
}


function updateEventSuccess(updateResponse){
    console.log("success "+updateResponse);
    if(updateResponse.status == "failure"){
        failureMessage(updateResponse.reason);

    }else{
        updateChangeList = "";
        successMessage('User data successfully saved');
        ajaxGETRequest(serviceURLs.AUDIT_LIST+eventID,showAuditList);
        $("#event_name").html(updateResponse.eventName);
    }
}

function showEvent(eventData){
    console.log("Event details "+eventData.eventName);
    eventDetail = eventData;
    $("#event_name").html(eventData.eventName);
    $("#eventName").val(eventData.eventName);
    $("#eventDetails").val(eventData.eventDetails);
    if(eventData.address != null && eventData.address.length > 0){
        $("#addressLine1").val(eventData.address[0].addressLine1);
        $("#addressLine2").val(eventData.address[0].addressLine2);
        $("#city").val(eventData.address[0].city);
        $("#state").val(eventData.address[0].state);
        $("#zipCode").val(eventData.address[0].zipCode);
        $("#country").val(eventData.address[0].country);
    }
    if(eventData.referenceId != null && eventData.referenceId != ""){
        $("#referenceId").val(eventData.referenceId);

    }

    //console.log("stats "+eventData.status);
    if(eventData.status == "open" || eventData.status == "Open"){
        $("#status_open").addClass('active');
    }else if(eventData.status == "Closed" || eventData.status == "closed" || eventData.status == "close" || eventData.status == "Close"){
        $("#status_closed").addClass('active');
    }else{
        $("#status_open").addClass('active');
    }

    loadCarousel(eventData);

    // load members
    ajaxGETRequest(serviceURLs.GET_ACTIVE_USER,showMemberList);

    //get tags
    ajaxGETRequest(serviceURLs.GET_TAGS,showTagList);
}


function loadAjaxContent(_contentID){
    var img = $("<img />").attr('src', serviceURLs.GET_CONTENT+'/'+_contentID)
        .load(function(response, status, xhr) {
            if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
                alert('broken image!');
            } else {
                $("#something").append(img);
            }
        });
    return img;
}

function showAuditList(_auditList){
    console.log("list length"+_auditList.auditlist.length);
    var list = "";
    for(i=0;i<_auditList.auditlist.length;i++){
        var updates = "";
        if(_auditList.auditlist[i].operationStr != undefined){
            updates =  _auditList.auditlist[i].operationStr.replace(/\_/g, ' ');
            updates = updates.replace(/\,/g, ' , ');
        }
        list += '<div class="alert alert-info"> '+_auditList.auditlist[i].user.lastName +" "+_auditList.auditlist[i].user.firstName+' made changes - '+_auditList.auditlist[i].transactionDate+' <br />'+_auditList.auditlist[i].operationType+' '+_auditList.auditlist[i].operationEntityType+' : '+updates+' </div>';
    }

    $("#audit_list").html(list);

}