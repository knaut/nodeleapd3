
/**
 * Module dependencies.
 */

// var express = require('express')
//   , routes = require('./routes')
//   , user = require('./routes/user')
//   , http = require('http')
//   , path = require('path')
//   , io = require('socket.io')
//   , osc = require('node-osc');

// var app = express();

// var express = require('express'),
	// routes = require('./routes'),
	// user = require('./routes/user'),
	// path = require('path'),
// 	http = require('http'),
// 	server = http.createServer(app),
// 	io = require('socket.io').listen(server);

var express = require('express'),
	http = require('http'),
	routes = require('./routes'),
	user = require('./routes/user'),
	path = require('path');

var app = express();
var server = http.createServer(app);
var io = require('socket.io');
var io = io.listen(server);

var osc = require('node-osc'),
	client = new osc.Client('127.0.0.1', 3333);


// io stuff
io.sockets.on('connection', function (socket) {

	var msg = new osc.Message('/oscAddress', 1);
	client.send(msg);

	console.log(msg);
});

// osc stuff
// var oscServer = new osc.Server(3333, '0.0.0.0');
// oscServer.on("message", function (msg, rinfo) {
// 	console.log("Message:");
// 	console.log(msg);
// });

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

// does this do anything?
app.get('/', function(req, res) {
	res.render('index', { title: 'Express', scripts: ['javascripts/script.js']});
});

// http.createServer(app).listen(app.get('port'), function(){
//   console.log('Express server listening on port ' + app.get('port'));
// });

app.listen( app.get('port'), function() {
	console.log("Express server listening on port " + app.get('port'));
});

server.listen(4000);