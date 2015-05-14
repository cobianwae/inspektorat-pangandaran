var bookshelf = require('models').bookshelf,
Promise = require('bluebird'),
bcrypt = require('bcrypt-nodejs');
require('./role');

var User = bookshelf.Model.extend({
	tableName : 'users',
	role : function() {
		return this.belongsTo('Role');
	},
	validPassword : function(password) {
		return bcrypt.compareSync(password, this.attributes.password);
	},
},{
	getOne : Promise.method(function(params) {
		return new this(params).fetch({withRelated : 'role'});
	}),
});

module.exports = bookshelf.model('User', User);