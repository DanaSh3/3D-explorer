/**
 * Created by Oscar on 11/9/13.
 */

//display a fancy success/error message in the side menu which will fade in and out:
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

function rightClick(){
    $(".h_node").on('contextmenu', function(ev) {
        var that = this;
        var menu = $(".custom-menu");
        menu.show();
        menu.css({top: event.pageY + "px", left: event.pageX + "px"});
        $(menu).click(function(){
            if (that.id == "/home"){
                statusMessage("Cannot delete HOME", true);
                return false;
            }
            var o = $('.h_node')[$(that).index()-1];
            if(o == undefined) return; //because multiple calls are being made to the method
            var id = that.id;
            deleteDir(id); //delete the selected file
            navigate(o); //navigate to the selected file
            $('#file_input').val('');

        });
        return false;
    });
    $(document).bind("click", function(event) {
        $("div.custom-menu").hide();
    });

};