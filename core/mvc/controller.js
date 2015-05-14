/**
* `Controller` constructor
*
* @api public
*/

function Controller() {
	this.beforeFilters = [];
	this.afterFilters = [];
}

Controller.prototype.before = function(actionName, handler) {
	this.beforeFilters[actionName] = handler;
};

Controller.prototype.after = function(actionName, handler){
	this.afterFilters[actionName] = handler;
};

module.exports = Controller;