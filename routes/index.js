
/*
 * GET home page.
 */

var fs = require('fs');
var path = "/Users/Oscar/Desktop/Fall2013/hackathon/master/public/home";

exports.index = function(req, res){
    res.render('main', { title: 'Main Room' });
};

exports.createDirectory = function(req, res){
    fs.mkdir(req.params.data, 0777, function(err){
        if(err){
            console.log("CANNOT CREATE HOME DIRECTORY!");
        }else{
            console.log("Successfully created file " + req.params.data);
        }
    });
}