var passport = require('passport'),
PassportLocal = require('passport-local').Strategy,
User = require('models/user');

function LocalStrategy(){}

LocalStrategy.prototype.initialize = function(){
	passport.use(new PassportLocal(function(username, password, done) {
		User.getOne({ username:username })
		.then(function(model) {
			if (model === null) {
				return done(null, false, { message : 'Incorrect username' });
			}
			if(!model.validPassword(password)) {
				console.log('masuk sini');
				return done(null, false, {	message : 'Incorrect password' });
			}
			var user = model.toJSON();
			return done(null, user);
		})
		.catch(function(err){
			return done(err);
		});
	}));
};

exports = module.exports = new LocalStrategy();
