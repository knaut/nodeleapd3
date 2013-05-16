
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

var osc = require('node-osc');
var client = new osc.Client('127.0.0.1', 3333);

// we define a fingerOsc obj
// to manage sending our osc data
var fingerOsc = {
	
	finger1Msg: null,
	finger2Msg: null,
	finger3Msg: null,
	finger4Msg: null,
	finger5Msg: null,

	finger1Send: function( data ) {
		this.finger1Msg = new osc.Message('/finger1', data);
		console.log( this.finger1Msg );
		client.send( this.finger1Msg );
	},

	finger2Send: function( data ) {
		this.finger2Msg = new osc.Message('/finger2', data);
		console.log( this.finger2Msg );
		client.send( this.finger2Msg );
	},

	finger3Send: function( data ) {
		this.finger3Msg = new osc.Message('/finger3', data);
		console.log( this.finger3Msg );
		client.send( this.finger3Msg );
	},

	finger4Send: function( data ) {
		this.finger4Msg = new osc.Message('/finger4', data);
		console.log( this.finger4Msg );
		client.send( this.finger4Msg );
	},

	finger5Send: function( data ) {
		this.finger5Msg = new osc.Message('/finger5', data);
		console.log( this.finger5Msg );
		client.send( this.finger5Msg );
	},
}

// io stuff
io.sockets.on('connection', function (socket) {

	// socket.emit('event', { message: 'emitting!'});

	socket.on('finger1Msg', function (data) {
		fingerOsc.finger1Send( data );
	});

	socket.on('finger2Msg', function (data) {
		fingerOsc.finger2Send( data );
	});

	socket.on('finger3Msg', function (data) {
		fingerOsc.finger3Send( data );
	});

	socket.on('finger4Msg', function (data) {
		fingerOsc.finger4Send( data );
	});

	socket.on('finger5Msg', function (data) {
		fingerOsc.finger5Send( data );
	});

	// socket.on('msg', function (data) {
	// 	console.log(data);

	// 	var msg = new osc.Message('/oscAddress', data);
		
	// 	console.log(msg);
	// 	client.send(msg);
	// });
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