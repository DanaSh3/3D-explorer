/**
 * Created by Oscar on 11/9/13.
 */
function initClick(){
    $('.h_node').click(function(e){
        var path = this.id;
        $('[id*=' + path + ']').each(function(){
            //this.remove();
            console.log(this.id);
        });
    });
}