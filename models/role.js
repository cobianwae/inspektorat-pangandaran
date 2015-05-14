var bookshelf = require('models').bookshelf;

var Role = bookshelf.Model.extend({
	tableName : 'roles'
});

module.exports = bookshelf.model('Role', Role);