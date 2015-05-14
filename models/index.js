var bookshelf = require('bookshelf');

function Bookshelf(){
	var knex = require('knex')({
		client: 'mysql',
		connection: {
			host     : '127.0.0.1',
			user     : 'root',
			password : '',
			database : 'inspektorat_pangandaran',
			charset  : 'utf8'
		}
	});

	this.bookshelf = bookshelf(knex);
	this.bookshelf.plugin('registry');
}

exports = module.exports = new Bookshelf();