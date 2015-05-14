var session = require('express-session'),
//config = require('config'),
passport = require('passport'),
RedisStore = require('connect-redis')(session),
glob = require('glob'),
path = require('path');

function Authentication(){};

Authentication.prototype.initialize = function(app) {
	app.use(session({
		secret : "1NsP3kT0r4T-P4nG4nD4r4N-UhU1",
		saveUninitialized: true,
		resave: true,
		store : new RedisStore({ 
			host : '127.0.0.1', 
			port : '6379', 
			// user : config.redis.username, 
			// pass : config.redis.password 
		}),
		cookie : {
		    maxAge : 604800 // one week
		}
	}));
	app.use(passport.initialize());
	app.use(passport.session());
	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(obj, done) {
		done(null, obj);
	});
	this._loadStrategies();
};

Authentication.prototype._loadStrategies = function(){
	glob.sync(path.join(__dirname, '*-strategy.js')).forEach(function(strategyFile) {
		var Strategy = require(strategyFile);
		Strategy.initialize();
	});
};

Authentication.prototype.authenticate = function(strategy, options, callback) {
	return passport.authenticate.apply(passport, arguments);
};

exports = module.exports = new Authentication();