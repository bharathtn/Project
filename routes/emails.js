var express = require('express');
var router = express.Router();
var sendEmail = require('../utils/gmails/send_mail');
var bodyParser = require('body-parser');
var os = require('os');

var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

console.log("IPs are : ", addresses[0]);

router.use(bodyParser.json());

router.post('/', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var uId = req.body.uid;
    var qId = req.body.qid;

    var link = "http://" + addresses[0] + ":3000/#/takefeedback?q=" + qId + "&u=" + uId;

    sendEmail({
        name: name,
        email: email,
        link: link
    }).then(function (d) {
        res.json({
            success: true,
            message: "Email sent!"
        });
    }).catch(function (e) {
        res.json({
            success: false,
            error: e,
            message: "Email failed!"
        });
    });

});

module.exports = router;
