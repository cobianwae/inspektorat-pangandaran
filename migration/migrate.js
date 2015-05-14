var knex = require('knex')({
	client: 'mysql',
	connection: {
		host     : '127.0.0.1',
		user     : 'root',
		password : '',
		database : 'inspektorat_pangandaran',
		debug: ['ComQueryPacket']
	}
});
var Schema = require('./schema');
var sequence = require('when/sequence');
var _ = require('lodash');
var Promise = require('bluebird');
var bcrypt =require('bcrypt-nodejs');

function dropTable(tableName){
	return knex.schema.dropTableIfExists(tableName);
}

function createTable(tableName) {
	return  knex.schema.createTable(tableName, function (table) {
		var column;
		var columnKeys = _.keys(Schema[tableName]);
		_.each(columnKeys, function (key) {
			if (Schema[tableName][key].type === 'text' && Schema[tableName][key].hasOwnProperty('fieldtype')) {
				column = table[Schema[tableName][key].type](key, Schema[tableName][key].fieldtype);
			}
			else if (Schema[tableName][key].type === 'string' && Schema[tableName][key].hasOwnProperty('maxlength')) {
				column = table[Schema[tableName][key].type](key, Schema[tableName][key].maxlength);
			}
			else {
				column = table[Schema[tableName][key].type](key);
			}
			if (Schema[tableName][key].hasOwnProperty('nullable') && Schema[tableName][key].nullable === true) {
				column.nullable();
			}
			else {
				column.notNullable();
			}
			if (Schema[tableName][key].hasOwnProperty('primary') && Schema[tableName][key].primary === true) {
				column.primary();
			}
			if (Schema[tableName][key].hasOwnProperty('unique') && Schema[tableName][key].unique) {
				column.unique();
			}
			if (Schema[tableName][key].hasOwnProperty('unsigned') && Schema[tableName][key].unsigned) {
				column.unsigned();
			}
			if (Schema[tableName][key].hasOwnProperty('references')) {
				column.references(Schema[tableName][key].references);
			}
			if (Schema[tableName][key].hasOwnProperty('defaultTo')) {
				column.defaultTo(Schema[tableName][key].defaultTo);
			}
		});
});
}

function dropAndCreateTables(trx){
	var arrCreateTables = [];
	var arrDropTables = [];
	var arrFunctions = [];
	var tableNames = _.keys(Schema);
	arrDropTables = _.map(tableNames, function (tableName) {
		return function() {
			return dropTable(tableName).transacting(trx);
		}
	});
	arrCreateTables = _.map(tableNames, function (tableName) {
		return function(){
			return createTable(tableName).transacting(trx);
		};
	});
	arrFunctions = arrDropTables.concat(arrCreateTables);
	return sequence(arrFunctions);
}


knex.transaction(function (trx) {
	console.log('begin transaction');
	knex.raw('SET foreign_key_checks = 0').transacting(trx)
	.then(function () {
		return 	dropAndCreateTables(trx);		
	})
	.then(function (){
		return knex.raw('SET foreign_key_checks = 1').transacting(trx);
	})
	.then(function(){
		var roles = [
		{title : 'admin'},
		{title : 'pemeriksa'},
		{title : 'evlap'},
		{title : 'irban'},
		{title : 'inspektur'},
		{title : 'dalnis'}	
		];
		var admin = {username: 'admin', email:'admin@cobianwae.com'};
		return knex('roles').insert(roles).transacting(trx)
		.then(function(){
			return knex('roles').where({title: 'admin'}).select('id');
		})
		.then(function(roles){
			var salt = bcrypt.genSaltSync(5);
			var hash = bcrypt.hashSync('hagemaru', salt, null);
			admin.password = hash;
			admin.role_id = roles[0].id;
			return knex('users').insert(admin).transacting(trx);
		});
	})
	.then(trx.commit)
	.then(function(){
		console.log('Tables created!!!');
		process.exit(0);
	})
	.catch(trx.rollback);
});