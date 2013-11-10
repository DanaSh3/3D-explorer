/**
 * Created by Oscar on 11/9/13.
 */
/*function initClick(){
    $('.h_node').click(function(e){
        var path = this.id;
        console.log(path);
        var that = this;
        $('[id*="' + path + '"]').each(function(){
            if (this !== that)
                this.remove();
        });
        socket.emit('mkdir', { dir: path });
    });
}*/

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