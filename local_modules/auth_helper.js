const pg = require('pg');
const pg_escape = require('pg-escape');
//pg.defaults.ssl = true;
var crypto = require('crypto');
const connectionString = process.env.DATABASE_URL;
var config = {
	user: process.env.PGUSER,
	database: process.env.PGDATABASE,
	password: process.env.PGPASSWORD,
	host: process.env.PGHOST,
	port: process.env.PGPORT,
	max: 10,
	idleTimeoutMillis: 30000,
}

var config_1 = {
  user: 'postgres',
  database: 'iwaconference',
  password: 'gooner95',
  host: 'localhost',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
}

const pg_pool = new pg.Pool(config);

var authenticate = function(user_details, cb){
	var password = user_details.password;
	var user_id = user_details.username;
	console.log("AUTH:" + user_id + " attempting to authenticate..");
	//console.log(user_id);
	var password_hash = crypto.createHash('md5').update(password).digest('hex');
	//console.log(password_hash);
	pg_pool.connect(function(err, client, done){
		if (err){
			return console.log(err);
		}
		client.query("SELECT abstract_ids FROM users WHERE user_id=$1 AND password=$2", [user_id, password_hash], function(err, result){
			done();
			if (err){
				cb("error");
			}
			else {
				if (result.rowCount == 0){
					cb("invalid");
				}
				else {
					console.log("AUTH: " + user_id + " authenticated");
					cb(result.rows[0].abstract_ids);
				}
			}
		})
	})
}

var add_user = function(user_details, cb){
	var password = user_details.password;
	var email = user_details.email;
	var user_id = user_details.user_id;
	var abstracts = user_details.a_ids;
	var password_hash = crypto.createHash('md5').update(password).digest('hex');
	if (typeof(abstracts) === 'undefined'){
		pg_pool.connect(function(err, client, done){
			if (err){
				return console.error(err);
			}
			client.query("INSERT INTO users VALUES($1, $2, NULL, $3)", [user_id, password_hash, email], function(err, result){
				done();
				if (err){
					console.log(err);
					cb("error");
				}
				else {
					console.log("AUTH: Added User");
					cb("success");
				}
			})
		})
	}
	else {
		var string = "";
		string+= '{';
		string+=abstracts.toString();
		string+='}';
		abstracts = string;
		console.log(abstracts);
		pg_pool.connect(function(err, client, done){
			if (err){
				return console.error(err);
			}
			client.query("INSERT INTO users VALUES($1, $2, $3, $4)", [user_id, password_hash, abstracts, email], function(err, result){
				done();
				if (err){
					console.log(err);
					cb("error");
				}
				else {
					console.log("AUTH: Added User");
					cb("success");
				}
			})
		})
	}
}

var classify_country = function(_country, cb){
	console.log("AUTH: Classifying Country " + _country);
	var country = String(_country);
	pg_pool.connect(function(err, client, done){
		if (err){
			return console.error(err);
		}
		client.query('SELECT class from countries WHERE LOWER(country_name)=LOWER($1)', [country], function(err, result){
			done();
			if (err || result.rowCount == 0){
				console.log(err);
				cb("error");
			}
			else {
				if (result.rows[0].class == 'hic'){
					console.log("AUTH: " + country + " is HIC");
					cb('hic');
				}
				else if (result.rows[0].class == 'lic'){
					console.log("AUTH: " + country + " is LIC");
					cb('lic');
				}
			}
		})
	})
}
var check_if_member = function(membership_no, last_name, cb){
	var num = membership_no;
	var l_name = pg_escape(last_name);
	console.log("AUTH: Checking if " + l_name + " is a member" );

	pg_pool.connect(function(err, client, done){
		if (err){
			return console.error(err);
		}
		client.query("SELECT * FROM iwa_members WHERE iwa_members.membership_no=$1 AND LOWER(iwa_members.family_name)=LOWER($2)", [num, l_name], function(err, result){
			done();
			if (err){
				console.error(err);
				cb("error");
			}
			else {
				if (result.rowCount == 0){
					console.error("AUTH: " + last_name + " not a member");
					cb("invalid");
				}
				else {
					console.log("AUTH: " + last_name + " is a member");
					cb(result.rows[0]);
				}
			}
		})
	})
}

module.exports = {
	authenticate: authenticate,
	add_user: add_user,
	check_if_member: check_if_member,
	classify_country: classify_country	
}