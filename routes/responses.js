var express = require('express');
var router = express.Router();
var Questionnaire = require('../models/questionnaire');
var Question = require('../models/question');
var Response = require('../models/response');
var MailingUser = require('../models/mailinguser');
var MailingList = require('../models/mailinglist');

router.get('/:uid', function (req, res) {
    var uid = req.params.uid;

    var responseData = {};
    var mUIds = [];
    var answersIDArrays = [];
    MailingList.find({
            user_id: uid
        }).exec().then(function (mailinglist) {
            responseData.mailinglist = mailinglist[0].toObject();

            mUIds = responseData.mailinglist.people;
            return MailingUser.find({}).where('_id').in(responseData.mailinglist.people);
        })
        .then(function (mailinguser) {
            responseData.mailinglist.people = mailinguser.map(function (d) {
                return d.toObject();
            });

            return Response.find({}).where('user_id').in(mUIds).exec();
        })
        .then(function (response) {
            responseData.response = response;

            var arr = responseData.response.map(function (d) {
                return d.qsnr_id + '';
            });

            var n = {},
                qnrID = [];
            for (var i = 0; i < arr.length; i++) {
                if (!n[arr[i]]) {
                    n[arr[i]] = true;
                    qnrID.push(arr[i]);
                }
            }

            return Questionnaire.find({}).where('_id').in(qnrID);
        })
        .then(function (questionnaire) {
            responseData.questionnaire = questionnaire;

            var qstnsID = [];
            responseData.questionnaire.forEach(function (qsnr) {
                qsnr.questions.forEach(function(qstn) {
                    qstnsID.push(qstn);
                });
            });

            var n = {},
                qstID = [];
            for (var i = 0; i < qstnsID.length; i++) {
                if (!n[qstnsID[i]]) {
                    n[qstnsID[i]] = true;
                    qstID.push(qstnsID[i]);
                }
            }

            return Question.find({}).where('_id').in(qstID);
        })
        .then(function (questions) {
            responseData.questions =  questions;

            res.json({
                data: responseData
            });
        })
        .catch(function (e) {
            console.log(e);
        });
});

module.exports = router;
