'use strict';

/* Controllers */

angular.module('angularRestfulAuth')

.controller('ResponsesCtrl', ['$scope', '$location', 'MainService', 'DS', function ($scope, $location, MainService, DS) {
    var mailingUserID, qsnrID;

    var filters = {
        mid: '',
        uid: '',
        qsnrID: ''
    };

    var queryString = $location.search();

    for (var flds in filters) {
        if (flds in queryString) {
            filters[flds] = queryString[flds];
        }
    }

    if (filters.mid != '')
        mailingUserID = filters.mid;

    if (filters.qsnrID != '')
        qsnrID = filters.qsnrID;

    console.clear();
    console.log(JSON.stringify(filters, null, ' '));

    function mailUserDefine() {
        return DS.find('mailingusersResource', mailingUserID, {
            deserialize: function (resource, data) {
                return data.data.mailinguser;
            }
        }).then(function (user) {
            console.log("userUser: ", user);
            console.log(JSON.stringify(user, null, ' '));
            return user;
        }, function () {
            $rootScope.error = 'Failed to fetch users';
        });
    }


    $scope.sendTo = function () {
        MainService.findAll('responses').then(function (responses) {
            responses.data.responses.forEach(function (response) {
                console.log("Outside", response);
                if (response.user_id == mailingUserID && response.qsnr_id == qsnrID) {
                    console.log("Inside", JSON.stringify(response, null, ' '));
                    console.log("QSTNRS", response.qsnr_id);

                    DS.find('questionnaireResource', response.qsnr_id, {
                            deserialize: function (resource, data) {
                                return data.data.questionnaire;
                            }
                        }).then(function (qstnr) {
                            console.log("Stringified Q: ", qstnr);
                            console.log("Selected Questionnaire: ", qstnr);
                            var text, type;
                            var ansArrs = [];

                            for (var i = 0; i < qstnr.questions.length; i++) {
                                for (var j = 0; j < response.answers.length; j++) {
                                    console.log("QQ", qstnr.questions);
                                    if (qstnr.questions[i]._id == response.answers[j].qstn_id) {
                                        var qstns = {
                                            qstn_id: qstnr.questions[i]._id,
                                            text: qstnr.questions[i].text,
                                            type: qstnr.questions[i].type,
                                            options: qstnr.questions[i].options,
                                            answer: response.answers[j].value
                                        };
                                        console.clear();
                                        console.log("Hi Q", qstns);
                                        ansArrs.push(qstns);
                                    }
                                }
                            }

                            if (ansArrs != undefined || ansArrs != null) {
                                //                            console.clear();
                                var user;
                                mailUserDefine().then(function (data) {
                                    user = data;
                                    var responseAnswers = {
                                        _id: response._id,
                                        user: user,
                                        qsnr_id: response.qsnr_id,
                                        answers: ansArrs
                                    }
                                    $scope.responseAnswers = responseAnswers;
                                    console.log("responseAnswers: ", JSON.stringify(responseAnswers, null, " "));
                                });
                                console.log("User = ", user);
                            }
                            console.log("qstnr", qstnr);
                            console.log("Hello There : " + qsnrID + '_' + mailingUserID + '_' + MainService.getCurrentUser().email);
                        });
                }
            });
        }, function (err) {
            console.log("Error Occurred", err);
        });
    }



    /*
        var questns = [];

        function returnQAns(answers) {
            answers.forEach(function (ans) {
                DS.find('questionsResource', ans.qstn_id, {
                    deserialize: function (resource, data) {
                        return data.data.question;
                    }
                }).then(function (qstn) {
                    console.log("Stringified Qstns: ", qstn);
                    var answer = {
                        _id: qstn._id,
                        text: qstn.text,
                        type: qstn.type,
                        options: qstn.options,
                        answers: ans.value
                    }
                    questns.push(answer);
                });
            });
        }

        MainService.findAll('responses').then(function (responses) {
            responses.data.responses.forEach(function (response) {
                if (response.user_id == mailingUserID && response.qsnr_id == qsnrID) {
                    console.log("Inside", JSON.stringify(response, null, ' '));
                    console.log("QSTNRS", response.qsnr_id);
                    console.log("ANS", response.answers);

                    if(questns.length == 0) {
                        returnQAns(response.answers);
                        console.log("questns", questns);
                    }
                }
            });
        });
    */
}]);
