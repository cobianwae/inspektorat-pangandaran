var express = require('express'),
glob = require('glob'),
util = require('util'),
path = require('path'),
exphbs = require('express-handlebars');

/**

/**
* `MVC` constructor.
*
* @api public
*/
function MVC(){
	this._modules = [];
	this._app = null;
	this._options = {};
	this._customRoutes = {};
}

/**
* Initialize MVC with required  'app' express application
*
* Options :
*	- 'modules' Property to add child application within certain area
* 	- 'dir' Property to determine the root of main app
*
* Examples:
*	mvc.init(app,{
*		modules : [{ 
*			name : 'admin',  
*			prefix : 'admin',
*			dir : 'path/to/directory'	
*		}]
*	});
*
*	mvc.init(app,{
*		modules : { 
*			name : 'admin',  
*			prefix : 'admin',
*			dir : 'path/to/directory'
*		}
*	});
*
* @param {Object} app
* @param {Object} options
* @api public
*/
MVC.prototype.init = function(app, options){
	this._app = app;
	this._options = options;
	this._verbs = ['get', 'post', 'put', 'delete'];

	this._initializeModules();
	this._setViewEngine();
	this._instantiateControllers();
};

/**
* Initialize `MVC` modules (using concept of `HMVC`) based on giveN modules options
*
* @api private
*/
MVC.prototype._initializeModules = function(){
	var _this = this;
	var optModules = [];
	
	if ( !_this._options.modules ) {
		_this._modules.unshift({
			prefix : '',
			app : _this._app,
			dir : _this._options.dir,
			home : _this._options.home
		});
		return;
	}

	if ( util.isArray(_this._options.modules) ){
		optModules = _this._options.modules;
	}else{
		optModules.push(_this._options.modules);
	}
	optModules.forEach(function(optModule){
		var module = {
			app : express(),
			dir : optModule.dir,
			home : optModule.home
		};
		var prefix = optModule.prefix || optModule.name;
		module.prefix = prefix;
		_this._app.use('/' + prefix, module.app);
		_this._modules.push(module);
	});

	_this._modules.unshift({
		prefix : '',
		app : _this._app,
		dir : _this._options.dir,
		home : _this._options.home
	});

};

/**
* Instantiate all controllers including all controllers in `MVC` children apps
*
* @api private
*/
MVC.prototype._instantiateControllers = function(){
	var _this = this;
	_this._modules.forEach(function (module){
		glob.sync(path.join(module.dir, 'controllers/*.js')).forEach(function (controllerFile){
			var controller = require(controllerFile);
			var arrName = controllerFile.split('/');
			var controllerName = arrName[arrName.length-1].replace('.js','').toLowerCase();
			_this._beforeActionExtraction(module, controller, controllerName);
			for (var propertyName in controller) {
				var split = propertyName.split(/(?=[A-Z])/);
				var verb = split[0];
				if ( _this._verbs.indexOf(verb) > -1 ) {
					_this._actionToRoute(module, controllerName, propertyName, controller[propertyName]);
				}
			}
		});
	});
};

/**
* Set view engine for every module. By default we will use express-handlebars
*
* @api private
*/
MVC.prototype._setViewEngine = function () {
	this._modules.forEach(function(module) {
		module.app.set('views', path.join(module.dir, 'views'));
		module.app.engine('.html', exphbs({
			extname : '.html',
			layoutsDir : path.join(module.dir, 'views/layouts'),
			partialsDir : path.join(module.dir, 'views/partials'),
			defaultLayout : 'main'
		}));
		module.app.set('view engine', '.html');
	});
};

/**
* Mapping controller action into express route
*
* @param {Object} app
* @param {String} controllerName
* @param {String} actionName
* @param {Function} handler
* @api private
*/
MVC.prototype._actionToRoute = function(module, controllerName, actionName, handler){
	var app = module.app;
	var split = actionName.split(/(?=[A-Z])/);
	var verb = split[0];
	var actionRoute = actionName.substring( verb.length, actionName.length ).toLowerCase();
	var routePath = util.format('/%s/%s/:id?', controllerName, actionRoute);
	//console.log(routePath);
	app[verb](routePath, handler);
	if ( actionRoute === 'index' ){
		app[verb](util.format('/%s/:id?', controllerName), handler);
	}
	if ( controllerName == module.home.controller && actionRoute == module.home.action && verb == 'get' ){
		app[verb]('/', handler);
	}
};


/**
* Apply before action middleware
*
* @param {Object} app
* @param {Object} controller
* @api private
*/
MVC.prototype._beforeActionExtraction = function(module, controller, controllerName) {
	var app = module.app;
	var _this = this;
	console.log(controller);
	var beforeFilters = controller.beforeFilters;
	beforeFilters.forEach(function (actionName, middleware) {
		if (index === 'all') {
			app.use('/' + controllerName, middleware);
		} else {
			_this._actionToRoute(module, controllerName, actionName, middleware);
		}
	});
};


module.exports = MVC;

// MVC.prototype._mapControllers = function( app, dir, routeDirector ){
// 	dir = dir || this._options.dir;
// 	app = app || this._app;

// 	var _this = this;

// 	if(routeDirector){
// 		var handlersMap = [];
// 		dir.forEach(function(singleDir){
// 			glob.sync(singleDir).forEach(function(controllerFile){
// 				var controller = require(controllerFile);
// 				var controllerName = controllerFile.replace('.js','').toLowerCase();
// 				_this._mapRouteHandler(controller, controllerName, handlersMap);
// 			});
// 		});
// 		_this._handlersMapToRoute(handlersMap, app, routeDirector);
// 	}else{
// 		glob.sync(dir).forEach(function(controllerFile){
// 			var controller = require(controllerFile);
// 			var controllerName = controllerFile.replace('.js','').toLowerCase();
// 			_this._mapRoute(controller,controllerName,app);
// 		});
// 	}	
// };

// MVC.prototype._mapRoute = function(controller, controllerName, module){
// 	for(var action in controller){
// 		if(action.indexOf('get') === 0){
// 			var routePath = util.format('/%s/%s/:id?',controllerName,action.replace(/^get/,''));
// 			module.get(routePath,controller[action]);
// 		}else if(action.indexOf('post') === 0){
// 			var routePath = util.format('/%s/%s/:id?',controllerName,action.replace(/^post/,''));
// 			module.post(routePath,controller[action]);
// 		}else if(action.indexOf('put') === 0){
// 			var routePath = util.format('/%s/%s/:id?',controllerName,action.replace(/^put/,''));
// 			module.put(routePath,controller[action]);
// 		}else if(action.indexOf('delete') === 0){
// 			var routePath = util.format('/%s/%s/:id?',controllerName,action.replace(/^delete/,''));
// 			module.delete(routePath,controller[action]);
// 		}
// 	}
// };

// MVC.prototype._mapRouteHandler = function(controller,controllerName,handlersMap){
// 	for(var actionName in controller){
// 		if(actionName.indexOf('get') === 0){
// 			var routePath = util.format('get/%s/%s/:id?',controllerName,actionName.replace(/^get/,''));
// 			handlersMap[routePath][dirMap.submoduleName] = controller[actionName];
// 		}else if(actionName.indexOf('post') === 0){
// 			var routePath = util.format('post/%s/%s/:id?',controllerName,actionName.replace(/^post/,''));
// 			handlersMap[routePath][dirMap.submoduleName] = controller[actionName];
// 		}else if(actionName.indexOf('put') === 0){
// 			var routePath = util.format('put/%s/%s/:id?',controllerName,actionName.replace(/^put/,''));
// 			handlersMap[routePath][dirMap.submoduleName] = controller[actionName];
// 		}else if(actionName.indexOf('delete') === 0){
// 			var routePath = util.format('delete/%s/%s/:id?',controllerName,actionName.replace(/^delete/,''));
// 			handlersMap[routePath][dirMap.submoduleName] = controller[actionName];
// 		}
// 	}
// };

// MVC.prototype._handlersMapToRoute = function(handlersMap,module,routeDirector){
// 	handlersMap.forEach(function(handlers,routePath){
// 		if(routePath.indexOf('get') === 0){
// 			module.get(routePath.replace(/^get/,''), (function(){
// 				var localHandlers = handlers;
// 				return routeDirector(localHandlers);
// 			})());
// 		}else if(routePath.indexOf('post') === 0){
// 			module.post(routePath.replace(/^post/,''), (function(){
// 				var localHandlers = handlers;
// 				return routeDirector(localHandlers);
// 			})());
// 		}else if(routePath.indexOf('put') === 0){
// 			module.put(routePath.replace(/^put/,''),(function(){
// 				var localHandlers = handlers;
// 				return routeDirector(localHandlers);
// 			})());
// 		}
// 	});
// };