
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

app.get('/3dexplorer', routes.index);

var io = require('socket.io').listen(app.listen(app.get('port')));

/*http.createServer(app).listen(app.get('port'), function(){
 console.log('Express server listening on port ' + app.get('port'));
 });*/

io.sockets.on('connection', function (socket) {
    //socket.emit('message', { message: 'welcome to the chat' });
    console.log("Web Socket Connection Established");
    socket.on('mkdir', function (data) {
        fs.mkdir("/Users/Sean/WebstormProjects/master-SEAN/public/" + data.dir, 0777, function(err){
            if(err){
                console.log("CANNOT CREATE HOME DIRECTORY!");
            }else{
                console.log("Successfully created file ");
            }
        });
        io.sockets.emit('mkdir', data);
    });
});

//app.post('/create', routes.createDirectory);