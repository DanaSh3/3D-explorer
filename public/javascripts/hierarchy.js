/**
 * Created by Oscar on 11/9/13.
 */

$
$('.h_node').click(function(e){
    console.log("CLICKED ON H_NODE");
    var path = this.id;
    $('.h_node [id*=' + path + ']').each(function(){
        console.log(this.id);
    });
});

$('#home_hello').click(function(){
    console.log("THIS IS HELLO");
});