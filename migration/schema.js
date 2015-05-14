var Schema = {
	roles: {
		id: {type: 'increments', nullable: false, primary: true},
		title: {type: 'string', maxlength: 150, nullable: false},
	},
	users: {
		id: {type: 'increments', nullable: false, primary: true},
		username : {type:'string', maxlength:65, nullable:false, unique:true},
		email: {type: 'string', maxlength: 254, nullable: false, unique: true},
		password: {type: 'string', maxlength: 150, nullable: true},
		role_id: {type: 'integer', nullable: false, unsigned:true, references:'roles.id'},
	}
};

module.exports = Schema;