var sg = require('./local_modules/sendgrid_helper.js');
var pg = require('./local_modules/postgres_helper.js');

var subject = 'IWA DIPCON Reminder';
var reminder = 'Dear Colleagues, \r\n\r\n' + 
			'This is a kind reminder that the full paper submission and early bird registration for IWA DIPCON is due on June 15, 2017. ' + 
			'Please visit our conference website (www.iwadipcon2017.org/) to complete your submission and registration. The presenters are highly encouraged to ' + 
			'register before the early bird registration to secure their presentation slot. \r\n\r\n' + 'Please make reservation for your stay at Luskin Center ' + 
			'(www.iwadipcon2017.org/venue) using conference code: DIPC0813. We strongly suggest reserving your room early if possible ' +
			'since we are advised that the facility may run out of rooms. Also the Luskin Center pricing is ' +
			'very competitive compared to other locations near the UCLA campus and in West Los Angeles. \r\n\r\n' +
			'If you have any question, please feel free to contact us at iwadipcon2017@hsseas.ucla.edu. \r\n\r\n' +
			'We are looking forward to seeing you in Los Angeles this August. \r\n\r\n' + 
			'Best regards,\r\n' + 
			'Michael K. Stenstrom, 2017 IWA DIPCON Conference Chair \r\n' + 
			'Mi-Hyun Park, IWA DIPCON Chair & 2017 DIPCON Conference Co-chair';

// Sends reminder emails to everyone listed
pg.get_all_extended_abstracts(function(data){
	for (var i = 0; i < data.length; i++)
	{
		var email = data[i].email;
		sg.send_generic_email(email, subject, reminder, null);
	}
});
