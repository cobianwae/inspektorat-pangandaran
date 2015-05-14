require('rootpath')();

var express = require('express');
var app = express();
var mvc = require('./core/mvc');
var authentication = require('./core/authentication');
var path = require('path');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
	extended: true,
	limit: '50mb'
}));
app.use(cookieParser());
app.use(compress());

app.use(flash());
authentication.initialize(app);
app.use('/public',express.static(__dirname + '/public'));
app.use('/bower_components',express.static(__dirname + '/bower_components'));
mvc.init(app, {
	dir : __dirname,
	home : {controller : 'home', action: 'index'},
	modules : {
		name : 'dashboard',
		prefix : 'dashboard',
		dir : path.join(__dirname, 'dashboard'),
		home : {controller: 'dashboard', action: 'index'}
	}
});

app.listen(3000, '127.0.0.1', function(){
	console.log("Listening on 127.0.0.1, server_port 3000");
});