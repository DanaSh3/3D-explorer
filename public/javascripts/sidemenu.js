
/******************************************LISTEN FOR SERVER RESPONSE*******************************************/

var socket;
window.onload = function() {
    socket = io.connect('http://localhost:3000'); //initialize socket io on local server
    //user navigated to a folder
    socket.on('showfiles', function (data) {
        var files = data.files;
        $('#folder_contents').html(''); //clear display
        if(files) {
            //$('#folder_contents').append('<div class = "subfolder" id = "' + files[i] + '">' + files[i] + '</div>');
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
        statusMessage(data.status, data.isError);
    });
    initClick();
}

/*************************INITIALIZE CLICK EVENTS FOR NEWLY ADDED DOM OBJECTS****************************/

//initializes the click events for all subfolders/files
function initSubfolder(){
    //if the user clicks on a subfolder, add the navigation node & navigate to that folder
    $('.subfolder').click(function(){
        $('#file_input').val(this.id); //change the value of the text field for adding the node
        openDir(); //add the node
    });
}

//initializes click events for all navigation (h) nodes
function initClick(){
    //if the user clicks on a node, navigate to that folder:
    $('.h_node').click(function(e){
        navigate(this);
    });
    //show subfolders of the current folder:
    showSubfolders($('.h_node').last().attr('id'));
}

/****************************************DISPLAY FOLDERS/FILES********************************************/

function navigate(node){
    var path = node.id;
    $('[id*="' + path + '"]').each(function(){
        if (this !== node)
            this.remove();
    });
    showSubfolders(path); //show subfolders of the selected folder
}

//displays the subfolders in the specified folder
function showSubfolders(path){
    var files = [];
    socket.emit('showdir', { dir: path, files: files });
}

//navigates to the folder specified by the text field
var openDir = function(){
    var filename = $('#file_input').val();
    if (filename.trim()){ //check if not empty (might extend)
        var path = $('.h_node').last().attr('id') + "\/" + filename;
        $("#hierarchy").append('<li id = "' +  path + '"class = "h_node"><a href="#" style="z-index:8;">' + filename + '</a></li>');
        initClick(); //re-initialize click events so that the newly added node will be clickable
    }
};

/**********************************CREATE & DELETE FILES/FOLDERS******************************************/

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

//delete the current directory
var deleteDir = function(){
    if ($('.h_node').length == 1){
        statusMessage("Cannot delete HOME", true);
        return;
    }
    var path = $('.h_node').last().attr('id');
    socket.emit('deletedir', { dir: path });
};

/*****************************************CLICK EVENTS*************************************************/

//create the directory when the user presses enter or clicks on the submit button:
$("#createDir").click(function(e){
    createDir();
    showSubfolders($('.h_node').last().attr('id'));
    $('#file_input').val('');
});

//delete current directory
$("#delete_dir").click(function(e){
    deleteDir();
    navigate($('.h_node')[$('.h_node').last().index() - 1]);
    $('#file_input').val('');
});

//hide menu
$("#menu-close").click(function(e) {
    e.preventDefault();
    $("#sidebar-wrapper").toggleClass("active");
});

//toggle menu
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#sidebar-wrapper").toggleClass("active");
});

//open options for creating directory
$("li .create_directory").click(function(e){
    $("form").toggle();
    $('#file_input').focus();
});