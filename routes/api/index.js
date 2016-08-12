/**
 * Created by Chirag on 16-04-2016.
 */
var express = require('express');
var router = express.Router();


/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('API home');
});


var authenticate=require('./authenticate');
var signup=require('./signup');
var users=require('./users');

var questions=require('./crud-routes/questions');
var questionnaires=require('./crud-routes/questionnaires');
var responses=require('./crud-routes/responses');

var mailingusers=require('./crud-routes/mailingusers');
var mailinglists=require('./crud-routes/mailinglists');


var authMiddleware=require('./../../middleware/jwt-auth-verify').auth;


router.use('/authenticate',authenticate);
router.use('/signup',signup);

router.use('/questions',questions);
router.use('/questionnaires',questionnaires);
router.use('/responses',responses);

router.use('/mailingusers',mailingusers);
router.use('/mailinglists',mailinglists);

router.use(authMiddleware);
//Authenticaed Routes:
router.use('/users',users);

module.exports=router;
