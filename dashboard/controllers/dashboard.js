var Controller = require('core/mvc').Controller;

var dashboardController = new Controller();


dashboardController.getIndex = function(req, res, next) {
	res.render('dashboard/index');
};

module.exports = dashboardController;