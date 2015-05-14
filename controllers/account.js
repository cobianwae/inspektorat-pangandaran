var Controller = require('core/mvc').Controller;
var Authentication = require('core/authentication');

var accountController = new Controller();

accountController.getLogin = function(req, res, next) {
	res.render('account/login');
};

accountController.postLogin = Authentication.authenticate('local', {
	successRedirect : '/dashboard',
	failureRedirect : '/account/login',
	failureFlash: true 
});

module.exports = accountController;