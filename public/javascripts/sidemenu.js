/**
 * Created by Wei on 11/2/13.
 */

var socket;
window.onload = function() {
    socket = io.connect('http://localhost:3000'); //initialize socket io on local server
    //user navigated to a folder
    socket.on('showfiles', function (data) {
        var files = data.files;
        $('#folder_contents').html(''); //clear display
        if(files) {
            for (var i = 0; i < files.length; i++){
                $('#folder_contents').append('<div class = "subfolder" id = "' + files[i] + '">' + files[i] + '</div>');
            }
            initSubfolder(); //make clickable
         } else {
            console.log("There is a problem:", data);
         }
    });
    //display status msg
    socket.on('status', function(data){
        if (!data.isError){
            showDir();
        }
        statusMessage(data.status, data.isError);
    });
    initClick();
}

//initializes the click events for all subfolders/files
function initSubfolder(){
    //if the user clicks on a subfolder, add the navigation node & navigate to that folder
    $('.subfolder').click(function(){
        $('#file_input').val(this.id); //change the value of the text field for adding the node
        showDir(); //add the node
    });
}
//initializes click events for all navigation (h) nodes
function initClick(){
    //if the user clicks on a node, navigate to that folder:
    $('.h_node').click(function(e){
        var path = this.id;
        var that = this; //saved instance of the clicked node
        $('[id*="' + path + '"]').each(function(){
            if (this !== that)
                this.remove();
        });
        showSubfolders(path); //show subfolders of the selected folder
    });
    //show subfolders of the current folder:
    showSubfolders($('.h_node').last().attr('id'));
}

//displays the subfolders in the specified folder
function showSubfolders(path){
    var files = [];
    socket.emit('showdir', { dir: path, files: files });
}

$("#menu-close").click(function(e) {
    e.preventDefault();
    $("#sidebar-wrapper").toggleClass("active");
});

$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#sidebar-wrapper").toggleClass("active");
});

$(function() {
    $('a[href*=#]:not([href=#])').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'')
            || location.hostname == this.hostname) {

            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top
                }, 1000);
                return false;
            }
        }
    });
});

$("li .create_directory").click(function(e){
    $("form").toggle();
    $('#file_input').focus();
});

//navigates to the folder specified by the text field
var showDir = function(){
    var filename = $('#file_input').val();
    if (filename.trim()){ //check if not empty (might extend)
        var path = $('.h_node').last().attr('id') + "\/" + filename;
        $("#hierarchy").append('<li id = "' +  path + '"class = "h_node"><a href="#" style="z-index:8;">' + filename + '</a></li>');
        initClick(); //re-initialize click events so that the newly added node will be clickable
    }
};

var createDir = function(){
    var filename = $('#file_input').val();
    if (filename.trim()){ //check if not empty (might extend)
        var path = $('.h_node').last().attr('id') + "\/" + filename;
        //SUBMIT:
        socket.emit('mkdir', { dir: path });
        statusMessage("Created folder: " + filename);
    }else{
        statusMessage("Invalid file name...", true);
    }
};

//create the directory when the user presses enter or clicks on the submit button:
$("#createDir").click(function(e){
    createDir();
    showSubfolders($('.h_node').last().attr('id'));
    $('#file_input').val('');
});