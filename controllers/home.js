var Controller = require('core/mvc').Controller;

var homeController = new Controller();

homeController.getIndex = function(req, res, next) {
	res.render('home/index');
};

module.exports = homeController;