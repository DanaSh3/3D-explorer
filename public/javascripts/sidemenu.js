/**
 * Created by Wei on 11/2/13.
 */

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
  });

$("#createDir").click(function(e){
    var filename = $('#file_input').val();
    if (filename.trim()){ //check if not empty (might extend)
        var path = '';
        path = $('.h_node').last().attr('id') + "_" + filename
        console.log(path);
        $("#hierarchy").append('<li id = "' +  path + '"class = "h_node"><a href="#" style="z-index:8;">' + filename + '</a></li>');
        $('#file_input').val('');
        statusMessage("Success!", false);
    }else{
        statusMessage("Invalid file name...", true);
    }
});

var timer;
var statusMessage = function(text, errMessage){
    var message = $('#message');
    message.html(text);
    if (errMessage){
        message.addClass('errorMessage');
        message.removeClass('statusMessage');
    }else{
        message.removeClass('errorMessage');
        message.addClass('statusMessage');
    }
    if (timer)
        clearTimeout(timer);
    message.fadeIn(1000, "swing", new function(){
        timer = setTimeout(function(){
            message.fadeOut(1500, "swing", function(){
                return;
            });
        }, 1750);
    });

}