
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fs = require('fs');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);

var io = require('socket.io').listen(app.listen(app.get('port')));

/*http.createServer(app).listen(app.get('port'), function(){
 console.log('Express server listening on port ' + app.get('port'));
 });*/

io.sockets.on('connection', function (socket) {
    console.log("Web Socket Connection Established");
    //MAKE DIRECTORY
    socket.on('mkdir', function (data) {
        var path = getPath(data.dir);
        data.isError = false;
        if (file_exists(path)){
            data.status = data.dir + " already exists";
        }else{
            data.status = "Successfully created " + data.dir;
            fs.mkdir(path, 0777, function(err){
                if(err){
                    data.isError = true;
                    data.status = "Failed to create " + data.dir;
                }
            });
        }
        //data.isDir = fs.statSync(path).isDirectory(); //determine if directory or file
        socket.emit('status', data);
    });
    //SHOW DIRECTORY
    socket.on('showdir', function(data){
        var path = getPath(data.dir);
        if (!file_exists(path)){
            return;
        }
        if (!fs.lstatSync(path).isDirectory()){
            return;
        }
        var files = fs.readdirSync(path);

        var isDir = [];
        //check each file/folder to determine if directory
        for (var i = 0; i < files.length; i++){
            isDir[i] = fs.lstatSync(path + "/" + files[i]).isDirectory();
        }
        data.files = files;
        data.isDir = isDir;
        io.sockets.emit('showfiles', data);
    });
    function getPath(filename){
        var path = String(filename);
        path = path.replace(/\//g, '\\');
        path = __dirname + "\\public" + path;
        return path;
    }
    //DELETE FOLDER/FILE
    socket.on('deletedir', function(data){
        var path = getPath(data.dir);
        deleteFolder(path);
        data.isError = false;
        data.status = "Deleted " + data.dir;
        socket.emit('status', data);
    });
    //DOES FILE EXIST?
    function file_exists(file){
        return fs.existsSync(file);
    }
    //DELETE FOLDER & CONTENTS
    function deleteFolder(path) {
        var files = [];
        if(file_exists(path)) {
            files = fs.readdirSync(path);
            files.forEach(function(file,index){
                var curPath = path + "/" + file;
                if(fs.statSync(curPath).isDirectory()) { // recursive call
                    deleteFolder(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };


    // new stuff for 3D
    socket.on('showdir3D', function(data){
        var path = getPath(data.dir);
        if (!file_exists(path)){
            return;
        }
        if (!fs.lstatSync(path).isDirectory()){
            return;
        }
        var files = fs.readdirSync(path);

        var isDir = [];
        //check each file/folder to determine if directory
        for (var i = 0; i < files.length; i++){
            isDir[i] = fs.lstatSync(path + "/" + files[i]).isDirectory();
        }
        data.files = files;
        data.isDir = isDir;
        io.sockets.emit('showfiles3D', data);
    });
});