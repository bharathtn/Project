var fs = require('fs');
var googleAuth = require('google-auth-library');
var google = require('googleapis');

function getOAuth2Client(cb) {
    // Load client secrets
    fs.readFile('utils/gmails/client_secret.json', function (err, data) {
        if (err) {
            return cb(err);
        }
        var credentials = JSON.parse(data);
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

        // Load credentials
        fs.readFile('utils/gmails/gmail-credentials.json', function (err, token) {
            if (err) {
                return cb(err);
            } else {
                oauth2Client.credentials = JSON.parse(token);
                return cb(null, oauth2Client);
            }
        });
    });
}

function sendSampleMail(options, auth, cb) {
    var gmailClass = google.gmail('v1');
    var email_lines = [];

    email_lines.push('From: "Bharath T N" <bharathtn12@gmail.com>');
    email_lines.push('To: ' + options.email);
    email_lines.push('Content-type: text/html;charset=iso-8859-1');
    email_lines.push('MIME-Version: 1.0');
    email_lines.push('Subject: this would be the subject');
    email_lines.push('');
    var link = options.link;
    var name = options.name;

    email_lines.push('<div class="email-background" style="background: #eee;padding: 10px;"> <div> <img id="logo" src="https://s19.postimg.org/kmfraacoz/logo.png" style="text-align:center;max-width:25%;text-decoration: none;"> <img id="img2" src="https://s19.postimg.org/x2h2hrver/Finallogo.png" alt="logo" style="float: right;max-width:10%;"> </div><br><br> <div> <img id="img1" src="https://s19.postimg.org/slk45crsz/rajth.png" alt="logo" style="max-width: 50%;display: block;margin-left: auto;margin-right: auto;"> </div> <div class="email-container" style="max-width: 800px;background: #51B7E8;font-family: sans-serif;overflow: hidden;border-radius: 5px;margin: 0 auto;text-align: center;"> <div> <p style="margin: 20px;font-size: 20px;font-weight: 300;line-height: 1.5;font-family: sans-serif;display: inline-block;letter-spacing: 0.5px;text-align: center;color: #eee;">Hi ' + name + ', Please Click on the below button to fill your FeedBack For Us. <br> Thank you.</p> </div> <div> <a href="' + link + '" class="btn btn-default" style="display: inline-block;padding: 6px 12px;margin-bottom: 0;font-size: 14px;font-weight: normal;line-height: 1.42857143;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius: 4px;color: #51B7E8;background-color: #eee;border-color: #ccc;text-decoration: none;">Fill Form</a></div><br><br></div><br></div>');

    var email = email_lines.join('\r\n').trim();

    var base64EncodedEmail = new Buffer(email).toString('base64');
    base64EncodedEmail = base64EncodedEmail.replace(/\+/g, '-').replace(/\//g, '_');

    gmailClass.users.messages.send({
        auth: auth,
        userId: 'me',
        resource: {
            raw: base64EncodedEmail
        }
    }, cb);
}

/*getOAuth2Client(function (err, oauth2Client) {
    if (err) {
        console.log('err:', err);
    } else {
        sendSampleMail(oauth2Client, function (err, results) {
            if (err) {
                console.log('err:', err);
            } else {
                console.log(results);
            }
        });
    }
});*/

function sendEmail(options) {
    return new Promise(function (resolve, reject) {
        getOAuth2Client(function (err, oauth2Client) {
            if (err) {
                reject({
                    e: err,
                    message: "OAuth Failure"
                });
            } else {
                sendSampleMail(options, oauth2Client, function (err, results) {
                    if (err) {
                        reject({
                            e: err,
                            message: "Send Mail Failure"
                        });
                    } else {
                        resolve({
                            success: true
                        });
                    }
                });
            }
        });
    });
}

module.exports = sendEmail;
