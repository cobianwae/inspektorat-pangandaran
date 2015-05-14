var MVC = require('./mvc'),
Controller = require('./controller')
/**
 * Export default singleton.
 *
 * @api public
 */
exports = module.exports = new MVC();
exports.Controller = Controller;