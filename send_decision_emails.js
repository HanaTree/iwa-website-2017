var sg = require('./local_modules/sendgrid_helper.js');
var pg = require('./local_modules/postgres_helper.js');

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

pg.get_all_extended_abstracts(function(data){
	for (var i = 0; i < data.length; i++){
		if (!data[i].decision_email_sent && data[i].decision > 0){
			var name = toTitleCase(data[i].author_title) + '. ' + toTitleCase(data[i].last_name);
			var email = data[i].email;
			var title = data[i].abstract_title;
			var abstract_id = data[i].abstract_id;
			var decision = data[i].decision;

			sg.send_decision_email(email, name, abstract_id, title, decision);
		}
	}
});