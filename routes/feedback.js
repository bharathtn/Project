var express = require('express');
var router = express.Router();
var Questionnaire = require('../models/questionnaire');
var Response = require('../models/response');
var MailingUser = require('../models/mailinguser');
var Question = require('../models/question');

router.get('/:qid/:uid', function (req, res) {
    var qid = req.params.qid;
    var uid = req.params.uid;

    var clientData = {};
    Questionnaire.find({
            _id: qid
        }).exec()
        .then(function (questionnaire) {
            clientData.questionnaire = questionnaire[0].toObject();

            return Question.find({}).where('_id').in(clientData.questionnaire.questions);
        })
        .then(function (questions) {
            clientData.questionnaire.questions = questions.map(function (d) {
                return d.toObject();
            });

            return Response.find({
                user_id: uid
            }).exec();
        })
        .then(function (response) {
            clientData.response = response[0].toObject();
            //Add reponse data details to clientData

            return MailingUser.find({
                _id: uid
            }).exec();
        }, function (e) {
            return MailingUser.find({
                _id: uid
            }).exec();
        })
        .then(function (user) {
            clientData.user = user[0].toObject();
            //Add user data to clientData

            res.json({
                data: clientData
            });
        })
        .catch(function (e) {
            console.log(e);
        });
});

router.get('/', function (req, res) {
    //Query Params: page, limit, select
    var options = req.query || {};

    options.page = options.page ? +options.page : 1;
    options.limit = options.limit ? +options.limit : 10;
    options.select = options.select ? options.select : fieldSelection.join(' ');

    // Use the Model model to find all entities
    /*
        Model.paginate({}, options, function (err, result) {
            if (!err) {
    */
    var clientData = {};
    Questionnaire.find({}).exec()
        .then(function (questionnaire) {
            clientData.questionnaire = questionnaire[0].toObject();

            return Question.find({}).where('_id').in(clientData.questionnaire.questions);
        })
        .then(function (questions) {
            clientData.questionnaire.questions = questions.map(function (d) {
                return d.toObject();
            });

            return Response.find({
                user_id: uid
            }).exec();
        })
        .then(function (response) {
            clientData.response = response[0].toObject();
            //Add reponse data details to clientData

            return MailingUser.find({
                _id: uid
            }).exec();
        }, function (e) {
            return MailingUser.find({
                _id: uid
            }).exec();
        })
        .then(function (user) {
            clientData.user = user[0].toObject();
            //Add user data to clientData

            res.json({
                data: clientData
            });
        })
        .catch(function (e) {
            console.log(e);
        });
    /*
                var d = {};
                d[pluralize(modelName)] = result.docs;
                d['meta'] = pick(result, ['total', 'limit', 'page', 'pages']);
                res.json(d);
            } else {
                console.error("GET /" + modelName, err);
                res.boom.badImplementation();
            }
        });
    */
});


module.exports = router;
