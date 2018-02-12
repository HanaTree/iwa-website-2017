var express = require('express');
var app = express();
var http = require('http').Server(app);
var router = express.Router();
var path = require('path');
var port = process.env.PORT || 8000;
const aws = require('aws-sdk');
aws.config.loadFromPath('./aws_config.json');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var psql_helper = require('./local_modules/postgres_helper.js');
var auth_helper = require('./local_modules/auth_helper.js');
var sendgrid_helper = require('./local_modules/sendgrid_helper.js');
const S3_BUCKET = "iwaconference";
var fs = require('fs');


app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use('/', router);

router.get('/submit/full_paper/', function(req, res){
	console.log("SERVER: Getting full paper submission link");
	res.render('full_paper_submission');
})
router.get('/submit/revised_extended_abstract/', function(req, res){
	console.log("SERVER: Getting revised abstract submission link");
	res.render('full_paper_submission');
})

router.get('/extended_abstract', function(request, response){
	var email = request.query.email;
	var last_name = request.query.last_name;
	var sample_response = [
	{
		abstract_id: 57,
		abstract_title: "TITLE 1",
		full_paper: "NA",
		revised_extended_abstract: "NA"
	},
	{
		abstract_id: 8,
		abstract_title: "TITLE 2"
	}
	];
	//response.render('partials/ea_table', {response: sample_response});


	psql_helper.get_abstracts_by_email_and_name({
		email: email,
		last_name: last_name
	}, function(res){
		if (res.status == "error"){
			response.send("error");
		}
		else {
			response.render('partials/ea_table', {response: res.data});
		}
	});
})

router.get('/', function(req, res){
	console.log("SERVER:Home Page Request");
	res.render('index');
})

router.get('/welcome', function(req, res){
	console.log("SERVER:welcome Page Request");
	res.render('welcome');
})
router.get('/about/dipcon', function(req, res){
	console.log("SERVER:about/dipcon request");
	res.render('dipcon');
})
router.get('/about/themes', function(req, res){
	console.log("SERVER:about/themes request");
	res.render('themes');
})
router.get('/about/committees', function(req, res){
	console.log("SERVER:About/committees request");
	res.render('committees');
})
router.get('/venue', function(req, res){
	console.log("SERVER:Venue request");
	res.render('venue');
})
router.get('/registration', function(req, res){
	console.log("SERVER:registration request");
	res.render('registration');
})
router.get('/contact', function(req, res){
	console.log("SERVER:contact request");
	res.render('contact');
})
router.get('/exhibition_sponsors', function(req, res){
	console.log("SERVER:exhibition_sponsors request");
	res.render('exhibition_sponsors');
})
router.get('/submission/extended_abstract', function(req, res){
	console.log("SERVER:submission/extended_abstract request");
	res.render('extended_abstract');
})
router.get('/submission/special_session', function(req, res){
	console.log("SERVER:submission/special_session request");
	res.render('special_session');
})
router.get('/program', function(req, res){
	res.render('program');
})
router.get('/submission/log_in', function(req, res){
	res.render('log_in');
})

// Ivan's edits
router.get('/program/overview', function(req, res){
    res.render('overview');
})

router.get('/program/speakers', function(req, res){
    res.render('speakers');
})

router.get('/program/tours', function(req, res){
    res.render('tours');
})

router.get('/program/artandenvironment', function(req, res){
    res.render('artandenvironment');
})

router.get('/program/ywp', function(req, res){
    res.render('ywp');
})

router.get('/program/social_events', function(req, res){
    res.render('social_events');
})

// End of program edits

router.get('/submission/full_paper', function(req, res){
	res.render('full_paper');
})
router.get('/submission/presentation_guideline', function(req, res){
	res.render('presentation_guideline');
})


router.get('/submission/extended_abstract/submit', function(req, res){
	res.render('submit_extended_abstract');
})

/*
router.get('/submission/workshop/submit', function(req, res){
	res.render('submit_workshop');
})
*/
router.get('/submission/sponsor/submit', function(req, res){
	res.render('submit_sponsor');
})

// Form Submission to email iwadipcon2017@hsseas.ucla.edu

router.get('/submit/sponsor', function(req, res){
	res.render('submit_sponsor');
})


router.get('/submit/workshop', function(req, res){
	res.render('submit_workshop');
})


router.get('/submission/full_paper/', function(req, res){
	res.render('full_paper');
})
router.get('/submission/presentation_guideline/', function(req, res){
	res.render('presentation_guideline');
})

router.get('/local_info', function(req, res){
    	console.log("SERVER:local_info request");
	res.render('local_info');
})


router.get('/admin', function(req, res){
	console.log("SERVER:Got admin request..");

	res.render('admin_login');
	/**/
})

router.post('/admin/', function(req, res){
	console.log("SERVER:Got login information...");
	auth_helper.authenticate(req.body, function(response){
		if (response == "error" || response == "invalid"){
			res.send("error logging in...");
		}
		else {
			var abstracts = response;
			if (abstracts === null){
				psql_helper.get_all_extended_abstracts(function(response){
					if (response == "error"){
						res.send("error getting extended abstracts");
					}
					else {

						console.log("SERVER: Received all abstracts");
						console.log(response);
						res.render('admin', {response: response});
					}
				});
			}
			else {
				psql_helper.get_extended_abstract_by_id(abstracts, function(response){
					if (response.status == "error"){
						res.send("error getting extended abstracts");
					}
					else {
						console.log("SERVER: Received abstracts for user");
						res.render('admin', {response: response.data});
					}
				})
			}
		}
	})

})
router.post('/submit/extended_abstract', function(req, res){
	console.log(req.files);
	var submission_file = req.files.ea_file;
	var extension = submission_file.name.split('.');
	extension = extension[extension.length - 1];
	var file_name = req.body.abstract_title + '_' + req.body.last_name + '.' + extension;
	console.log(file_name);
	var abstract_title = req.body.abstract_title;
	var presentation_type = req.body.presentation_type;
	var email = req.body.email;

	submission_file.mv(__dirname + '/uploads/' + file_name, function(err){
		if (err) {
			res.status(500).send(err);
		}
		else {
			req.body.file_path = __dirname + '/uploads/' + file_name;
			var file_buffer = fs.readFileSync(req.body.file_path);
	    //var meta_data = getContentTypeByFile(req.body.file_path);
	    var s3 = new aws.S3();
	    console.log("SERVER:AWS BUCKET: " + S3_BUCKET);
	    const s3_params = {
	    	ACL: 'public-read',
	    	Bucket: S3_BUCKET,
	    	Key: file_name,
	    	Body: file_buffer
		//ContentType: meta_data
	}
	s3.putObject(s3_params, function(err, data){
		if (err){
			console.log(err);
			res.send("error");
		}
		else {
			console.log("SERVER:File uploaded onto S3");
			console.log(data);
			req.body.file_url = `https://${S3_BUCKET}.s3.amazonaws.com/${file_name}`;
			psql_helper.add_extended_abstract(req.body, function(response){
				if (response.status == "error"){
					res.send("Upload error");
				}
				else {
					fs.unlinkSync(req.body.file_path);
					res.render("upload_success", {id: response.data, title: abstract_title, presentation_type: presentation_type, email: email, type: 'Extended Abstract'});
					sendgrid_helper.send_confirmation_email({id: response.data, title: abstract_title, presentation_type: presentation_type, email: email, type: 'Extended Abstract'});
				}
			});
		}
	})
	    //console.log("SERVER:Moved file to uploads..");
	    /**/

	}
})
});

router.get('/admin/download_extended_abstract/:id', function(req, res){
	psql_helper.get_extended_abstract_by_id(req.params.id, function(response){
		if (response.status == "error"){
			res.send("Couldn't get EA");
		}
		else {
			console.log("SERVER:Found EA, sending file for download");
			var file_path = '/uploads/' + response.data.abstract_file_name;
	    //console.log(file_path);
	    var file_name = response.data.abstract_file_name.split('/')[2];
	    //console.log(file_name);
	    res.download(file_path, file_name);

	}
})
})

router.post('/admin/add_user', function(req, res){
	auth_helper.add_user(req.body, function(status){
		if (status=="error"){
			res.send("error");
		}
		else {
			res.send("success");
		}
	})
})
router.post('/submit/revised_extended_abstract', function(req, res){
	var abstract_id = req.body.abstract_id;
	console.log("SERVER: Adding Revised EA for Abstract - " + abstract_id);
	var submission_file = req.files.revised_ea;
	var extension = submission_file.name.split('.');
	extension = extension[extension.length - 1];
	var file_name = 'Revised_Extended_Abstract_' + abstract_id + '.' + extension;
	console.log(file_name);

	submission_file.mv(__dirname + '/uploads/' + file_name, function(err){
		if (err){
			res.status(500).send(err);
		}
		else {
			req.body.file_path = __dirname + '/uploads/' + file_name;
			var file_buffer = fs.readFileSync(req.body.file_path);
			var s3 = new aws.S3();
			console.log("SERVER:AWS BUCKET: " + S3_BUCKET);
			const s3_params = {
				ACL: 'public-read',
				Bucket: S3_BUCKET,
				Key: 'revised_extended_abstracts/' + file_name,
				Body: file_buffer
			}
			s3.putObject(s3_params, function(err, data){
				if (err){
					console.log(err);
					res.send("error");
				}
				else {
					console.log("SERVER:File uploaded onto S3");
					console.log(data);
					var form_url = `https://${S3_BUCKET}.s3.amazonaws.com/revised_extended_abstracts/${file_name}`;
					console.log(form_url);
					req.body.file_url = `https://${S3_BUCKET}.s3.amazonaws.com/revised_extended_abstracts/${file_name}`;
					psql_helper.add_revised_ea(abstract_id, req.body.file_url, function(response){
						if (response.status == "error"){
							res.send("Upload error");
						}
						else {
							var author_email = response.data[0].email;
							fs.unlinkSync(req.body.file_path);
							res.send("Successfully Added Revised Extended Abstract");
							var emails = ['avikejariwal@ucla.edu', 'mhpark@seas.ucla.edu', 'stenstro@seas.ucla.edu'];
							var subject = 'Revised Extended Abstract Added For Abstract ID: ' + abstract_id;
							var body = 'Revised Extended Abstract added for Abstract ID: ' + abstract_id + ' \r\n' +
							'Review at ' + form_url + ' \r\n' +
							'- IWA DIPCON 2017';
							for (var i = 0; i < emails.length; i++){
								sendgrid_helper.send_generic_email(emails[i], subject, body);
							}

							subject = 'Successfully Received Revised Extended Abstract Submission For Abstract ID: ' + abstract_id;
							body = 'Dear Author,\r\n\r\n' +
								   'Your Revised Extended Abstract Submission to the IWA DIPCON Conference 2017 has successfully been received.\r\n\r\n' +
               						'Regards, \r\n' +
              						'Michael K. Stenstrom, 2017 IWA DIPCON Conference Chair \r\n' +
               						'Mi-Hyun Park, IWA DIPCON Chair & 2017 DIPCON Conference Co-chair';
               				console.log("SERVER: Sending author confirmation email");
               				sendgrid_helper.send_generic_email(author_email, subject, body);
						}
					});
				}
			});
		}
	})
})

router.post('/submit/full_paper', function(req, res){


	var abstract_id = req.body.abstract_id;
	var journal_consideration = req.body.journal_review_option;
	if (typeof journal_consideration == "undefined"){
		journal_consideration = 'false';
	}
	else {
		journal_consideration = 'true';
	}
	console.log("SERVER: Adding Full Paper for Abstract - " + abstract_id);
	var submission_file = req.files.full_paper;
	console.log(submission_file.name);
	var extension = submission_file.name.split('.');
	extension = extension[extension.length - 1];
	var file_name = 'Full_Paper_' + abstract_id + '.' + extension;

	submission_file.mv(__dirname + '/uploads/' + file_name, function(err){
		if (err){
			res.status(500).send(err);
		}
		else {
			req.body.file_path = __dirname + '/uploads/' + file_name;
			var file_buffer = fs.readFileSync(req.body.file_path);
			var s3 = new aws.S3();
			console.log("SERVER:AWS BUCKET: " + S3_BUCKET);
			const s3_params = {
				ACL: 'public-read',
				Bucket: S3_BUCKET,
				Key: 'full_papers/' + file_name,
				Body: file_buffer
			}
			s3.putObject(s3_params, function(err, data){
				if (err){
					console.log(err);
					res.send("error");
				}
				else {
					console.log("SERVER:File uploaded onto S3");
					console.log(data);
					var form_url = `https://${S3_BUCKET}.s3.amazonaws.com/full_papers/${file_name}`
					req.body.file_url = `https://${S3_BUCKET}.s3.amazonaws.com/full_papers/${file_name}`;
					psql_helper.add_extended_abstract_full_paper(abstract_id, journal_consideration, req.body.file_url, function(response){
						if (response.status == "error"){
							res.send("Upload error");
						}
						else {
							console.log(response.data);
							var author_email = response.data[0].email;
							fs.unlinkSync(req.body.file_path);
							res.send("Successfully Added Full Paper");
							var emails = ['avikejariwal@ucla.edu', 'mhpark@seas.ucla.edu', 'stenstro@seas.ucla.edu'];
							var subject = 'Full Paper  Added For Abstract ID: ' + abstract_id;
							var body = 'Full paper added for Abstract ID: ' + abstract_id + ' \r\n' +
							'Review at ' + form_url + ' \r\n' +
							'- IWA DIPCON 2017';
							for (var i = 0; i < emails.length; i++){
								sendgrid_helper.send_generic_email(emails[i], subject, body);
							}

							subject = 'Successfully Received Full Paper Submission For Abstract ID: ' + abstract_id;
							body = 'Dear Author,\r\n\r\n' +
								   'Your Full Paper Submission to the IWA DIPCON Conference 2017 has successfully been received.\r\n\r\n' +
               						'Regards, \r\n' +
              						'Michael K. Stenstrom, 2017 IWA DIPCON Conference Chair \r\n' +
               						'Mi-Hyun Park, IWA DIPCON Chair & 2017 DIPCON Conference Co-chair';
               				console.log("SERVER: Sending author confirmation email");
               				sendgrid_helper.send_generic_email(author_email, subject, body);
						}
					});
				}
			});
		}
	})
})

router.post('/submit/extended_abstract_review',function(req, res){
	var abstract_id = req.body.abstract_id;
	console.log("SERVER: Adding Review form for extended_abstract with id: " + abstract_id);

	var submission_file = req.files.review_form;
	var extension = submission_file.name.split('.');
	extension = extension[extension.length - 1];
	var file_name = abstract_id + '_Reviewer_Form';
	console.log(file_name);

	submission_file.mv(__dirname + '/uploads/' + file_name, function(err){
		if (err) {
			res.status(500).send(err);
		}
		else {
			req.body.file_path = __dirname + '/uploads/' + file_name;
			var file_buffer = fs.readFileSync(req.body.file_path);
	    //var meta_data = getContentTypeByFile(req.body.file_path);
	    var s3 = new aws.S3();
	    console.log("SERVER:AWS BUCKET: " + S3_BUCKET);
	    const s3_params = {
	    	ACL: 'public-read',
	    	Bucket: S3_BUCKET,
	    	Key: file_name,
	    	Body: file_buffer
		//ContentType: meta_data
	}
	s3.putObject(s3_params, function(err, data){
		if (err){
			console.log(err);
			res.send("error");
		}
		else {
			console.log("SERVER:File uploaded onto S3");
			console.log(data);
			var form_url = `https://${S3_BUCKET}.s3.amazonaws.com/${file_name}`
			req.body.file_url = `https://${S3_BUCKET}.s3.amazonaws.com/${file_name}`;
			psql_helper.add_extended_abstract_review(abstract_id, req.body.file_url, function(response){
				if (response.status == "error"){
					res.send("Upload error");
				}
				else {
					fs.unlinkSync(req.body.file_path);
					res.render("review_form_upload_success");
				    var emails = ['avikejariwal@ucla.edu', 'mhpark@seas.ucla.edu', 'stenstro@seas.ucla.edu'];
					var subject = 'Review Form Added For Abstract ID: ' + abstract_id;
					var body = 'Review Form added for Abstract ID: ' + abstract_id + ' \r\n' +
					'Review at ' + form_url + ' \r\n' +
					'- IWA DIPCON 2017';
					for (var i = 0; i < emails.length; i++){
						sendgrid_helper.send_generic_email(emails[i], subject, body);
					}
				}
			});
		}
	});
};
});
});

router.get('/register', function(req, res){
 	console.log("SERVER: Got register page request");
	res.render('register');
})

router.post('/register/member', function(req, res){
	console.log("SERVER: Got request to check for member");
	var membership_no = req.body.membership_no;
	var last_name = req.body.last_name;
	var country = req.body.country;
	auth_helper.classify_country(country, function(response){
		if (response == "error"){
			res.send("SERVER: error getting country info")
		}
		else if (response == 'lic'){
			auth_helper.check_if_member(membership_no, last_name, function(response){
				if (response == "error"){
					res.send("Error checking for membership, please try again later");
				}
				else if (response == "invalid"){
		    //res.send("Couldn't find valid membership information");
		    res.redirect('https://commerce.cashnet.com/40135DIPNONMEMBER?ITEMCODE=40135DIPNO-L')
		}
		else {
		    //res.send("LIC Country and Member");
		    res.redirect('https://commerce.cashnet.com/40135DIPIWA?ITEMCODE=40135DIPIW-L');
		}
	})
		}
		else if (response == 'hic'){
			auth_helper.check_if_member(membership_no, last_name, function(response){
				if (response == "error"){
					res.send("Error checking for membership, please try again later");
				}
				else if (response == "invalid"){
		    //res.send("Couldn't find valid membership information");
		    res.redirect('https://commerce.cashnet.com/40135DIPNONMEMBER?ITEMCODE=40135DIPNO-H')
		}
		else {
		    //res.send("LIC Country and Member");
		    res.redirect('https://commerce.cashnet.com/40135DIPIWA?ITEMCODE=40135DIPIW-H');
		}
	})
		}
	})
})

router.post('/register/non_member', function(req, res){
	console.log("SERVER: Got request to register as non_member");
	var country = req.body.country;
	auth_helper.classify_country(country, function(response){
		if (response == "error"){
			res.send("SERVER: error getting country info")
		}
		else if (response == 'lic'){
			if (req.body.group1 == 'student'){
		//res.send("LIC Country and Student");
		res.redirect('https://commerce.cashnet.com/40135DIPCONSTUDENT?ITEMCODE=40135DIPCO-L');
	}
	else {
		//res.send("LIC Country and Non-Student");
		res.redirect('https://commerce.cashnet.com/40135DIPNONMEMBER?ITEMCODE=40135DIPNO-L');
	}
}
else if (response == 'hic'){
	if (req.body.group1 == 'student'){
		//res.send("HIC Country and Student");
		res.redirect('https://commerce.cashnet.com/40135DIPCONSTUDENT?ITEMCODE=40135DIPCO-R');
	}
	else {
		//res.send("HIC Country and Non-Student");
		res.redirect('https://commerce.cashnet.com/40135DIPNONMEMBER?ITEMCODE=40135DIPNO-H');
	}
}
});
})

router.post('/admin/reviewer_email', function(req, res){
	console.log("SERVER: Got request to update reviewer_email");
	var email = req.body.email;
	var id = req.body.id;
	psql_helper.update_reviewer_email(email, id, function(data){
		if (data == null){
			console.error("Failed to update Reviewer Information");
			res.send("Failed to perform transaction, press back");
		}
		else {
			psql_helper.get_all_extended_abstracts(function(response){
				if (response == "error"){
					res.send("error getting extended abstracts");
				}
				else {
					res.render('admin', {response: response});
				}
			});
		}
	} )
})

http.listen(port, function(){
	console.log("SERVER:listening on port: " + port);
});



///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
// Sponsorship Submission

router.post('/submit/sponsor', function(req, res){

    console.log(req.files);
    var submission_file = req.files.sponsor_file;
    var extension = submission_file.name.split('.');
    extension = extension[extension.length - 1];
    var file_name = req.body.last_name + '.' + extension;
    console.log(file_name);

    submission_file.mv(__dirname + '/uploads/' + file_name, function(err){
	if (err) {
	    res.status(500).send(err);
	}
	else {
	    req.body.file_path = __dirname + '/uploads/' + file_name;
	    var file_buffer = fs.readFileSync(req.body.file_path);
	    //var meta_data = getContentTypeByFile(req.body.file_path);
	    var s3 = new aws.S3();
	    console.log("SERVER:AWS BUCKET: " + S3_BUCKET);
	    const s3_params = {
	    	ACL: 'public-read',
	    	Bucket: S3_BUCKET,
	    	Key: file_name,
	    	Body: file_buffer
		//ContentType: meta_data
	    }
	    s3.putObject(s3_params, function(err, data){
		if (err){
		    console.log(err);
		    res.send("error");
		}
		else {
		    console.log("SERVER:File uploaded onto S3");
		    console.log(data);
		    req.body.file_url = `https://${S3_BUCKET}.s3.amazonaws.com/${file_name}`;

		    sendgrid_helper.send_generic_email('iwadipcon2017@hsseas.ucla.edu', 'Sponsorship Form', 'This is a sponsorship form', file_name);


		    fs.unlinkSync(req.body.file_path);
		    res.render("submit_success", {id: null, title: file_name, presentation_type: null, email: null, type: 'Sponsorship Form'});
		}}	)}})

});


///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
// Workshop Submission

router.post('/submit/workshop', function(req, res){

    console.log(req.files);
    var submission_file = req.files.sponsor_file;
    var extension = submission_file.name.split('.');
    extension = extension[extension.length - 1];
    var file_name = req.body.last_name + '.' + extension;
    console.log(file_name);

    submission_file.mv(__dirname + '/uploads/' + file_name, function(err){
	if (err) {
	    res.status(500).send(err);
	}
	else {
	    req.body.file_path = __dirname + '/uploads/' + file_name;
	    var file_buffer = fs.readFileSync(req.body.file_path);
	    //var meta_data = getContentTypeByFile(req.body.file_path);
	    var s3 = new aws.S3();
	    console.log("SERVER:AWS BUCKET: " + S3_BUCKET);
	    const s3_params = {
	    	ACL: 'public-read',
	    	Bucket: S3_BUCKET,
	    	Key: file_name,
	    	Body: file_buffer
		//ContentType: meta_data
	    }
	    s3.putObject(s3_params, function(err, data){
		if (err){
		    console.log(err);
		    res.send("error");
		}
		else {
		    console.log("SERVER:File uploaded onto S3");
		    console.log(data);
		    req.body.file_url = `https://${S3_BUCKET}.s3.amazonaws.com/${file_name}`;

		    sendgrid_helper.send_generic_email('iwadipcon2017@hsseas.ucla.edu', 'Workshop Proposal Form', 'This is a workshop proposal form', file_name);


		    fs.unlinkSync(req.body.file_path);
		    res.render("submit_success", {id: null, title: file_name, presentation_type: null, email: null, type: 'Workshop Form'});
		}}	)}})
});
