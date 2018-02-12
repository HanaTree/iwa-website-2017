var sg = require('sendgrid')('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');
var helper = require('sendgrid').mail;
var fs = require('fs');


var send_confirmation_email = function(data){
    
    var from_email = new helper.Email('donotreply@iwadipcon2017.org');
    var to_email = new helper.Email(data.email);
    var subject = 'IWADIPCON 2017: ' + data.type + ' Submission Received';
    var body = 'Succesfully Received ' + data.type + ' Submission \r\n' + 
        'Submission ID: ' + data.id + '\r\n' + 
        'Submission Title: ' + data.title + '\r\n' + 
        'Presentation Type: ' + data.presentation_type + '\r\n' + 
        'Please keep this information securely. It will be required to modify your submissions and add a full paper later on.'; 
    var content = new helper.Content('text/plain', body);
    var mail = new helper.Mail(from_email, subject, to_email, content); 

    var request = sg.emptyRequest({
         method: 'POST',
        path: '/v3/mail/send',
         body: mail.toJSON(),
    });

    sg.API(request, function(error, response) {
        if (error){
            console.error(error);
        }
        else {
            console.log("SENDGRID_HELPER: Confirmation Email sent to " + data.email);
            console.log(response.body);
            console.log(response.headers);
        }
    });
}

var send_reviewer_email = function(email, user_id){
    console.log('SENDGRID_HELPER: Sending email to ' + email);
    var from_email = new helper.Email('info@iwadipcon2017.org', 'IWA DIPCON 2017');
    var to_email = new helper.Email(email);
    var subject = 'Re: IWA DIPCON Review Extended Abstracts';
    var body = 'Dear Colleague, \r\n' +   
               '\r\n' + 
               'Thank you for serving as an abstract reviewer for the 18th IWA Conference on Diffuse Pollution & Eutrophication (DIPCON). Your voluntary service is key to help us bring the best in research and technology to DIPCON 2017 attendees. Please find the attached form for your review. As a reviewer for DIPCON 2017, you agree to:\r\n' + 
               '\r\n' + 
               /*'We apologize for an error in the formatting of the previous Abstract Review Form sent yesterday. Please download the new version and upload this to the admin portal post completion. \r\n' + 
               '\r\n' + 
               'Very Truly Yours, \r\n' + 
               'Michael K. Stenstrom, 2017 IWA DIPCON Conference Chair \r\n' + 
               'Mi-Hyun Park, IWA DIPCON Chair & 2017 DIPCON Conference Co-chair';
               '\r\n' + */
               '    1. Read each submission carefully and thoughtfully.\r\n' + 
               '    2. Strive to ensure that peer review of each abstract is fair, unbiased and timely. \r\n' + 
               '    3. Ensure that the content, and subsequent peer review of each abstract remain confidential. \r\n' +
               '\r\n' + 
               'Your constructive feedback is important for authors who need improvement. Feedback need not be lengthy; a few attentive sentences will do. Your confidential comments to the conference committee are useful to aid the selection of abstracts and arranging technical session. \r\n' + 
               '\r\n' + 
               'Please submit abstract reviews by designated timelines (April 15). We apologize for delivering the abstract to you on such short notice due to two extensions of abstract submission deadline. We appreciate your understanding, time and expertise in helping our conference! \r\n' + 
               '\r\n' + 
               'To view your assigned abstracts, please visit https://www.iwadipcon2017.org/admin and use the following credentials: \r\n' + 
               'username: ' + user_id + '\r\n' + 
               'password: ' + user_id + '2017 \r\n' + 
               '\r\n' +
               'To view an abstract, simply scroll to the right and click the download button. After reviewing, you can upload the review form on the same page. \r\n' + 
               '\r\n' + 
               'Very Truly Yours, \r\n' + 
               'Michael K. Stenstrom, 2017 IWA DIPCON Conference Chair \r\n' + 
               'Mi-Hyun Park, IWA DIPCON Chair & 2017 DIPCON Conference Co-chair';


    var body1 = 'Dear Colleagues, \r\n' + 
         '\r\n' + 
         'This a reminder to all who are yet to submit their extended abstract reviews. If you have already submitted your reviews, you may ignore this email.\r\n' + 
         '\r\n' + 
         'All reviews should be submitted as soon as possible. We would appreciate your attention to this matter and look forward to receiving your review at the earliest possible time.\r\n' + 
         '\r\n' + 
         'We are attaching the revised review form just in case.\r\n' + 
         '\r\n' + 
         'Thanks,\r\n' + 
         'Michael Stenstrom, 2017 IWA DIPCON, Conference Chair\r\n' + 
         'Mi-Hyun Park, IWA DIPCON Chair & 2017 DIPCON, Conference Co-chair';

    var content = new helper.Content('text/plain', body1);
    //console.log(body);
    var file = fs.readFileSync('Abstract_review_form_DIPCON2017_Form.pdf');
    var base64File = new Buffer(file).toString('base64');
    var attachment = new helper.Attachment();
    attachment.setContent(base64File);
    attachment.setType('application/pdf');
    attachment.setFilename('DIPCON2017 Extended Abstract Review Form.pdf');
    attachment.setDisposition('attachment');

    var mail = new helper.Mail(from_email, subject, to_email, content); 
    mail.addAttachment(attachment);

    var request = sg.emptyRequest({
         method: 'POST',
        path: '/v3/mail/send',
         body: mail.toJSON(),
    });

    sg.API(request, function(error, response) {
        if (error){
            console.error(error);
        }
        else {
            console.log("SENDGRID_HELPER: Confirmation Email sent to " + user_id);
            //console.log(response.body);
            //console.log(response.headers);
        }
    });
}




var send_generic_html_email = function(email, _subject, _body, _attachment){
  console.log('SENDGRID_HELPER: Sending generic email to ' + email);
  var from_email = new helper.Email('notification@iwadipcon2017.org', 'IWA DIPCON 2017');
  var to_email = new helper.Email(email);
  var subject = _subject;
  var body = _body;
  var content = new helper.Content('text/plain', body);
  var mail = new helper.Mail(from_email, subject, to_email, content); 

  if (_attachment != null){
    var file = fs.readFileSync('uploads/' + attachment);
    var base64File = new Buffer(file).toString('base64');
    var attachment = new helper.Attachment();
    attachment.setContent(base64File);
    attachment.setFilename(_attachment);
    attachment.setDisposition('attachment');
    mail.addAttachment(attachment);
  }

  var request = sg.emptyRequest({
         method: 'POST',
        path: '/v3/mail/send',
         body: mail.toJSON(),
    });

   sg.API(request, function(error, response) {
        if (error){
            console.error(error);
        }
        else {
            console.log("SENDGRID_HELPER: Generic Email sent to " + email);
            //console.log(response.body);
            //console.log(response.headers);
        }
    });
}






var send_decision_email = function(email, name, abstract_id, title, decision){
  console.log("SENDGRID_HELPER: Sending Decision Email To " + name);
  var a_id = abstract_id + 1000;
  var from_email = new helper.Email('notification@iwadipcon2017.org', 'IWA DIPCON 2017');
  var to_email = new helper.Email(email);
  var subjects = ['Acceptance Notice for Oral Presentation at IWA DIPCON2017',
                 'Acceptance Notice for Poster Presentation at IWA DIPCON2017',
                 'Acceptance Notice for Poster/Alternate Presentation at IWA DIPCON2017',
                 'Notice for Your Abstract Submission for IWA DIPCON2017'];
  var bodies = [];
  bodies[0] = 'Dear ' + name + ',\r\n\r\n' + 
            'Thank you for your abstract submission to the 18th IWA Diffuse Pollution and Eutrophication Conference (IWA DIPCON 2017) to be held on August 13-17, 2017 in Los Angeles, USA. Based on the scientific committee’s review, we are pleased to notify you that your abstract '+ a_id +' entitled:\r\n\r\n\"' + 
            title + '...\"\r\n\r\n' + 
            'has been accepted in the program as an oral presentation (15min presentation). We would like to request that you should submit a full paper no later than June 15, 2017. Kindly follow the full paper guidelines that can be downloaded from the conference website (https://www.iwadipcon2017.org). If you do not plan to submit a full paper, please make sure that your extended abstract follows the IWA format as provided in the template on conference website (https://www.iwadipcon2017.org/submission/extended_abstract). The submission of revised abstract is also due on June 15, 2017. A presentation slide template will be also provided on the conference website.\r\n\r\n' + 
            'Please be informed that a subset of entire papers will be published in Water Science and Technology, Desalination and the Journal of Environmental Science subsequent to the review by the scientific committee.\r\n\r\n' + 
            'Conference registration is now open and please take advantage of early bird registration by June 15, 2017 (https://www.iwadipcon2017.org/registration) and make reservation for your stay at Luskin Center (https://www.iwadipcon2017.org/venue) using conference code: DIPC0813. Please reserve your room early if possible since we are advised that the facility may run out of rooms. Also the Luskin Center pricing is very competitive compared to other locations near the UCLA campus and in West Los Angeles. \r\n\r\n' + 
            'We are looking forward to seeing you in Los Angeles. \r\n\r\n' + 
            'Best, \r\n\r\n' + 
            'Michael K. Stenstrom, 2017 IWA DIPCON, Conference Chair \r\n' + 
            'Mi-Hyun Park, IWA DIPCON Chair & 2017 DIPCON, Conference Co-chair';

  bodies[1] = 'Dear ' + name + ',\r\n\r\n' + 
            'Thank you for your abstract submission to the 18th IWA Diffuse Pollution and Eutrophication Conference (IWA DIPCON 2017) to be held on August 13-17, 2017 in Los Angeles, USA. Based on the scientific committee’s review, we are pleased to notify you that your abstract ' + a_id + ' entitled: \r\n\r\n\"' + 
            title + '...\"\r\n\r\n' + 
             'has been accepted in the program as a poster presentation. We would like to request that you should submit full paper no later than June 15, 2017. Kindly follow the full paper guidelines that can be downloaded from the conference website (https://www.iwadipcon2017.org). If you do not plan to submit a full paper, please make sure that your extended abstract follows the IWA format as provided in the template on conference website (https://www.iwadipcon2017.org/submission/extended_abstract). The submission of revised abstract is also due on June 15, 2017. A poster template will be also provided on the conference website.\r\n\r\n' +
            'Please be informed that a subset of entire papers will be published in Water Science and Technology, Desalination and the Journal of Environmental Science subsequent to the review by the scientific committee.'
            'Conference registration is now open and please take advantage of early bird registration by June 15, 2017 (https://www.iwadipcon2017.org/registration) and make reservation for your stay at Luskin Center (https://www.iwadipcon2017.org/venue) using conference code: DIPC0813. Please reserve your room early if possible since we are advised that the facility may run out of rooms. Also the Luskin Center pricing is very competitive compared to other locations near the UCLA campus and in West Los Angeles.\r\n\r\n' + 
            'We are looking forward to seeing you in Los Angeles.\r\n' + 
            'Best, \r\n\r\n' + 
            'Michael K. Stenstrom, 2017 IWA DIPCON, Conference Chair \r\n' + 
            'Mi-Hyun Park, IWA DIPCON Chair & 2017 DIPCON, Conference Co-chair';

  bodies[2] = 'Dear ' + name + ',\r\n\r\n' + 
            'Thank you for your abstract submission to the 18th IWA Diffuse Pollution and Eutrophication Conference (IWA DIPCON 2017) to be held on August 13-17, 2017 in Los Angeles, USA. Based on the scientific committee’s review, we are pleased to notify you that your abstract ' + a_id + ' entitled: \r\n\r\n \"' + 
            title + '...\"\r\n\r\n' + 
            'has been accepted in the program as a poster. We will also be considering your abstract as an alternative for platform presentation in case of cancellation of scheduled platform presentations.\r\n\r\n' + 
            'We would like to request that you should submit a full paper no later than June 15, 2017. Kindly follow the full paper guidelines that can be downloaded from the conference website (https://www.iwadipcon2017.org). If you do not plan to submit a full paper, please make sure that your extended abstract follows the IWA format as provided in the template on conference website (https://www.iwadipcon2017.org/submission/extended_abstract). The submission of revised abstract is also due on June 15, 2017. A poster template will be also provided on the conference website.\r\n\r\n' + 
            'Please be informed that a subset of entire paper will be published in Water Science and Technology, Desalination and the Journal of Environmental Science subsequent to the review by the scientific committee.\r\n\r\n' + 
            'Conference registration is now open and please take advantage of early bird registration by June 15, 2017 (https://www.iwadipcon2017.org/registration) and make reservation for your stay at Luskin Center (https://www.iwadipcon2017.org/venue) using conference code: DIPC0813. Please reserve your room early if possible since we are advised that the facility may run out of rooms. Also the Luskin Center pricing is very competitive compared to other locations near the UCLA campus and in West Los Angeles. \r\n\r\n' + 
            'We are looking forward to seeing you in Los Angeles.\r\n' + 
            'Best, \r\n\r\n' + 
            'Michael K. Stenstrom, 2017 IWA DIPCON, Conference Chair \r\n' + 
            'Mi-Hyun Park, IWA DIPCON Chair & 2017 DIPCON, Conference Co-chair';

  bodies[3] = 'Dear ' + name + ',\r\n\r\n' + 
             'Thank you for your abstract submission to the 18th IWA Diffuse Pollution and Eutrophication Conference (IWA DIPCON 2017) to be held on August 13-17, 2017 in Los Angeles, USA. Based on the scientific committee’s review, we regret to inform you that your abstract ' + a_id + ' entitled: \r\n\r\n\"' + 
            title + '...\"\r\n\r\n' + 
            'has been rejected. Your abstract addresses interesting subject but unfortunately, it is beyond the scope of our conference.  However, you are still welcome to attend our conference and join us in the future conferences.\r\n\r\n' + 
            'Conference registration is now open and please take advantage of early bird registration by June 15 (https://www.iwadipcon2017.org/registration) and make reservation for your stay at Luskin Center (https://www.iwadipcon2017.org/venue) using conference code: DIPC0813. \r\n\r\n' + 
            'We are looking forward to seeing you in Los Angeles.\r\n\r\n' + 
            'Best, \r\n\r\n' + 
            'Michael K. Stenstrom, 2017 IWA DIPCON, Conference Chair \r\n' + 
            'Mi-Hyun Park, IWA DIPCON Chair & 2017 DIPCON, Conference Co-chair';

  var subject, body;

  subject = subjects[decision-1];
  body = bodies[decision-1];

  var content = new helper.Content('text/plain', body);
  var mail = new helper.Mail(from_email, subject, to_email, content); 

  var request = sg.emptyRequest({
         method: 'POST',
        path: '/v3/mail/send',
         body: mail.toJSON(),
    });

  sg.API(request, function(error, response) {
        if (error){
            console.error(error);
        }
        else {
            console.log("SENDGRID_HELPER: Extended Abstract Email sent to " + name + " - " + email);
        }
    });
}

module.exports = {
    send_confirmation_email: send_confirmation_email,
    send_reviewer_email: send_reviewer_email,
    send_generic_email: send_generic_html_email,
    send_decision_email: send_decision_email
} 
