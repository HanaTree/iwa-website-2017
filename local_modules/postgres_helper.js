const pg = require('pg');
const pg_escape = require('pg-escape');
const connectionString = process.env.DATABASE_URL;
//pg.defaults.ssl = true;
var config = {
	user: process.env.PGUSER,
	database: process.env.PGDATABASE,
	password: process.env.PGPASSWORD,
	host: process.env.PGHOST,
	port: process.env.PGPORT,
	max: 10,
	idleTimeoutMillis: 30000,
}

/*var config = {
  user: 'postgres',
  database: 'iwaconference',
  password: 'gooner95',
  host: 'localhost',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
}*/
const pg_pool = new pg.Pool(config);

var get_abstracts_by_email_and_name = function(info, cb){
	console.log("POSTGRES: Fetching abstracts for " + info.last_name + " - " + info.email)
	pg_pool.connect(function (err, client, done){
		if (err){
			return console.error(err);
		}
		info.email = pg_escape(info.email);
		info.last_name = pg_escape(info.last_name);
		console.log(info.last_name);
		client.query(
			"SELECT * FROM extended_abstract WHERE email=$1 AND lower(last_name)=lower($2)", [info.email, info.last_name], function(err, result){
				done();
				if (err){
					throw err;
					cb({
						status: 'error',
						data: null
					});
				}
				else {
					console.log("POSTGRES: Got all EA's for " + info.email);
					cb({
						status: 'success',
						data: result.rows
					});
				}
			});
	});
}

var add_extended_abstract = function(info, cb){
	console.log(process.env.DATABASE_URL);
	pg_pool.connect(function(err, client, done){
		if (err){
			return console.error(err);
		}
		client.query(
			"INSERT INTO extended_abstract(author_title,first_name,last_name,institute,position,department,address,postal_code,city,country,phone_number,email,abstract_title,presenters_name,keyword_1,keyword_2,keyword_3,abstract_topic,presentation_type, abstract_file_name) VALUES( \
			$1,\
			$2,\
			$3,\
			$4,\
			$5,\
			$6,\
			$7,\
			$8,\
			$9,\
			$10,\
			$11,\
			$12,\
			$13,\
			$14,\
			$15,\
			$16,\
			$17,\
			$18,\
			$19,\
			$20) RETURNING abstract_id",
			[ info.author_title,
			info.first_name,
			info.last_name,
			info.institute,
			info.position,
			info.department,
			info.address,
			info.postal_code,
			info.city,
			info.country,
			info.phone_number,
			info.email,
			info.abstract_title,
			info.presenters_name,
			info.keyword_1,
			info.keyword_2,
			info.keyword_3,
			info.abstract_topic,
			info.presentation_type,
			info.file_url],
			function(err, result){
				done();
				if (err) {
					throw err;
					cb({
						status: 'error',
						data: null
					});
				}
				else {
					var id = parseInt(result.rows[0].abstract_id) + 1000
					console.log("POSTGRES:Abstract Id: " + id);
					console.log("POSTGRES:Success");
					cb({
						status: 'success',
						data: id
					});
				}
			}
			);
	});
}

var get_reviewers_emails = function(cb){
	console.log("POSTGRES: Getting all users");

	pg_pool.connect(function(err, client, done){
		if (err){
			return console.error(err);
		}
		client.query('SELECT email FROM users WHERE email IS NOT NULL', function(err, result){
			done();

			if (err) throw err;
			console.log("POSTGRES: Got all reviewers emails");
			cb(result.rows);
		})
	})
}

var get_topic_by_id = function(id,cb){
	console.log("POSTGRES:Getting abstract_topic by id...");

	pg_pool.connect(function(err, client, done){
		if (err){
			return console.error(err);
		}
		client.query('SELECT * FROM abstract_topics WHERE abstract_id=$1',[id], function(err, result){
			done();

			if (err) throw err;
			console.log(result.rows[0].topic.trim());
			cb(result.rows[0].topic.trim());
		});
	});
}

var delete_abstract_by_id = function(id){
	console.log("POSTGRES:Delete Abstract with id: " + id);
	var a_id = id - 1000;
	if (a_id < 0){
		console.error("Abstract ID has to be 4 digits");
		return null;
	}

	pg_pool.connect(function(err, client, done){
		if (err){
			return console.error(err);
		}
		client.query('DELETE FROM extended_abstract WHERE abstract_id=$1', [a_id], function(err, result){
			done();

			if (err) {
				console.error(err);
				return null;
			}
			console.log(result.rows);
			console.log("POSTGRES:Delete succesfull");
		})
	})
}

var update_reviewer_email = function(email, id, cb){
	console.log("POSTGRES:Updating reviewer_email to " + email + " for abstract_id=" + id + "...");
	var a_id = id - 1000;
	if (a_id < 0){
		console.error("Abstract ID has to be 4 digits");
		return null;
	}

	pg_pool.connect(function(err, client, done){
		if (err){
			console.error(err);
		}
		client.query('UPDATE extended_abstract SET reviewer_email=$1 WHERE abstract_id=$2', [email, a_id], function(err, result){
			done();

			if (err){
				console.error(err);
				return null;
			}

			console.log(result.rows);
			console.log("POSTGRES:Updated Reviewer email");
			cb(result.rows);
		})
	})


}

var get_all_extended_abstracts = function(cb){
	console.log("POSTGRES:Getting all extended abstracts...");

	pg_pool.connect(function(err, client, done){
		if (err){
			return console.error(err);
		}
		client.query('SELECT * FROM extended_abstract ORDER BY abstract_id', function(err, result){
		done();
		if (err){
			console.log(err);
			cb("error");
		}
		else {
			console.log("POSTGRES:Got all EAs");
			cb(result.rows);
		}
	})
	});
}

var get_extended_abstract_by_id = function(id, cb){
	console.log("POSTGRES:Getting extended_abstract by id: " + id);

	pg_pool.connect(function(err, client, done){
		if (err){
			return console.log(err);
		}
		client.query('SELECT * FROM extended_abstract WHERE abstract_id=ANY(ARRAY[' + id.join() + '])', function(err, result){
			done();
			if (err){
				console.log(err);
				cb({
					status: "error",
					data: null
				});
			}
			else {
				console.log("POSTGRES:Got EA(s)");
				cb({
					status: "success",
					data: result.rows
				});
			}
		})
	})
}
var add_revised_ea = function(id, form_url, cb){
	console.log("POSTGRES: Adding Revised EA to extended_abstract with id-" + id);

	pg_pool.connect(function(err, client, done){
		if (err){
			return console.log(err);
		}

		client.query('UPDATE extended_abstract SET revised_extended_abstract=$1 WHERE abstract_id=$2 RETURNING email', [form_url, id], function(err, result){
			done();
			if (err){
				console.log(err);
				cb({
					status: "error",
					data: null
				});
			}
			else {
				console.log("POSTGRES: Updated reviewer");
				cb({
					status: "success",
					data: result.rows
				})
			}
		})
	})
}

var add_extended_abstract_full_paper = function(id, _journal_consideration, form_url, cb){
	console.log("POSTGRES: Adding Full Paper to extended_abstract with id - " + id);

	pg_pool.connect(function(err, client, done){
		if (err){
			return console.log(err);
		}

		client.query('UPDATE extended_abstract SET journal_consideration=$1, full_paper=$2 WHERE abstract_id=$3 RETURNING email', [_journal_consideration, form_url, id], function(err, result){
			done();
			if (err){
				console.log(err);
				cb({
					status: "error",
					data: null
				});
			}
			else {
				console.log("POSTGRES: Updated Full Paper");
				cb({
					status: "success",
					data: result.rows
				})
			}
		})
	})
}

var add_extended_abstract_review = function(id, form_url, cb){
	console.log("POSTGRES: Adding Revised Extended Abstract to extended_abstract with id-" + id);

	pg_pool.connect(function(err, client, done){
		if (err){
			return console.log(err);
		}


		client.query('UPDATE extended_abstract SET review_form=$1 WHERE abstract_id=$2', [form_url, id], function(err, result){
			done();
			if (err){
				console.log(err);
				cb({
					status: "error",
					data: null
				});
			}
			else {
				console.log("POSTGRES: Updated Revised Extended Abstract");
				cb({
					status: "success",
					data: null
				})
			}
		})
	})
}

module.exports = {
	add_extended_abstract: add_extended_abstract,
	get_topic_by_id: get_topic_by_id,
	get_all_extended_abstracts: get_all_extended_abstracts,
	get_extended_abstract_by_id: get_extended_abstract_by_id,
	delete_abstract_by_id: delete_abstract_by_id,
	update_reviewer_email: update_reviewer_email,
	add_extended_abstract_review: add_extended_abstract_review,
	get_reviewers_emails: get_reviewers_emails,
	get_abstracts_by_email_and_name: get_abstracts_by_email_and_name,
	add_extended_abstract_full_paper: add_extended_abstract_full_paper,
	add_revised_ea: add_revised_ea
}
