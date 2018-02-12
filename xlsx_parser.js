if(typeof require !== 'undefined') XLSX = require('xlsx');
//var auth_helper = require('./local_modules/auth_helper.js');
var workbook = XLSX.readFile('list_review.xlsx');
var sendgrid_helper = require('./local_modules/sendgrid_helper.js');

var first_sheet_name = workbook.SheetNames[0];

var abstract_id_suffix = 'B';
var reviewer_name_1_suffix = 'W';
var reviewer_email_1_suffix = 'X';
var reviewer_name_2_suffix = 'Y';
var reviewer_email_2_suffix = 'Z';
var address_of_cell = 'B2';

/* Get worksheet */
var worksheet = workbook.Sheets[first_sheet_name];

var reviewers = [];
var reviewer = {
	'name': "",
	'email': "",
	'a_ids': []
};

for (var i = 2; i <= 136; i++){

	var a_id = (worksheet[abstract_id_suffix.concat(i.toString())] ? worksheet[abstract_id_suffix.concat(i.toString())].w.trim() : undefined);

	var rn1 = (worksheet[reviewer_name_1_suffix.concat(i.toString())] ? worksheet[reviewer_name_1_suffix.concat(i.toString())].w.trim() : undefined);
	var re1 = (worksheet[reviewer_email_1_suffix.concat(i.toString())] ? worksheet[reviewer_email_1_suffix.concat(i.toString())].w.trim() : undefined);
	var rn2 = (worksheet[reviewer_name_2_suffix.concat(i.toString())] ? worksheet[reviewer_name_2_suffix.concat(i.toString())].w.trim() : undefined);
	var re2 = (worksheet[reviewer_email_2_suffix.concat(i.toString())] ? worksheet[reviewer_email_2_suffix.concat(i.toString())].w.trim() : undefined);

	//console.log("RE1: " + rn1 + " RE2: " + rn2 + " AID: " + a_id);

	add_id(a_id, rn1, re1);
	add_id(a_id, rn2, re2);
}


function add_id(id, name, email){
	//console.log(id + " " + name + " " + email);
	if (typeof name === 'undefined'){
		//console.log("undefined name");
		return;
	}
	var inserted = false;
	for (var i = 0; i < reviewers.length; i++){
		if (reviewers[i]['name'].localeCompare(name) == 0){
			//console.log("FOUND " + name);
			reviewers[i]['a_ids'].push(id);
			inserted = true;
			return;
		}
	}
	if (!inserted){	

		var split_names = name.toLowerCase().split(' ');
		//console.log("ADDED " + name);
		var temp_r  = {
			name: name,
			email: email, 
			user_id: split_names[1] + split_names[0],
			password: split_names[1] + split_names[0] + '2017',
			a_ids: [id]
		};
		

		reviewers.push(temp_r);
	}
	return;
}

console.log(reviewers);
console.log();

//sendgrid_helper.send_reviewer_email('avikejariwal@ucla.edu', 'avikejariwal');
for (var i = 0; i < reviewers.length; i++){
	/*auth_helper.add_user(reviewers[i], function(data){
		console.log(data);
	});*/
	sendgrid_helper.send_reviewer_email(reviewers[i].email, reviewers[i].user_id);
};


//send email to reviewers with password and form 

//sendgrid_helper.send_reviewer_email('avikejariwal@ucla.edu', 'avikejariwal');
