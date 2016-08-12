'use strict';

angular.module('MainApps')
    .factory('ClientService', ['$rootScope', '$http', '$localStorage', '$timeout', '$q', function ($rootScope, $http, $localStorage, $timeout, $q) {
        return {
            findFeedback: function (resource, qID, uID) {
                return $http.get(resource + '/' + qID + '/' + uID);
            }
        };
}])

.controller('ClientCtrl', ['$rootScope', '$scope', '$location', 'MainService', 'ClientService', 'DS', function ($rootScope, $scope, $location, MainService, ClientService, DS) {
    $scope.showMainApp = false;
    $scope.showFB = false;
    var mainFBObject;

    $scope.loadFeedback = function () {
        var uID, qID;
        var returnedFeedback = {};

        var filters = {
            q: '',
            u: '',
        };

        var queryString = $location.search();

        for (var flds in filters) {
            if (flds in queryString) {
                filters[flds] = queryString[flds];
            }
        }

        if (filters.q != '')
            qID = filters.q;

        if (filters.u != '')
            uID = filters.u;


        console.log(JSON.stringify(filters, null, ' '));

        var answers = [];

        ClientService.findFeedback('feedback', qID, uID).then(function (data) {
            returnedFeedback = data.data.data;
            console.log("Feedback is : ", returnedFeedback);
        }, function (err) {
            console.log("Error occurred: ", JSON.stringify(err, null, ' '));
        }).then(function () {
            returnedFeedback.questionnaire.questions.forEach(function (question) {
                if (question.type == "MCQN" || question.type == "mcqn") {
                    question.type = "checkbox";
                } else if (question.type == "MCQ1" || question.type == "mcq1") {
                    question.type = "radio";
                } else if (question.type == "TEXT" || question.type == "text") {
                    question.type = "text";
                } else if (question.type == "RATE" || question.type == "rate") {
                    question.type = "radio";
                    question.options = [];
                    question.options.push("1", "2", "3", "4", "5");
                }

                returnedFeedback.response.answers.forEach(function (answer) {


                    if (question._id == answer.qstn_id) {
                        if (question.type == "text") {
                            var ans = {
                                qstn_id: question._id,
                                text: question.text,
                                type: question.type,
                                options: question.options,
                                value: []
                            }

                            ans.value.push(answer.value);

                        } else if (question.type == "checkbox") {
                            console.log(answer.value)
                            var ans = {
                                qstn_id: question._id,
                                text: question.text,
                                type: question.type,
                                options: question.options,
                                value: []
                            }
                            $scope.changedPracticeId = function (index, text, $event) {
                                var checkbox = $event.target;
                                if (checkbox.checked) {
                                    text.value.push(text.options[index]);
                                } else {
                                    text.value.splice(text.options[index], 1);
                                }
                            }
                        } else if (question.type == "radio" || question.type == "rate") {

                            var ans = {
                                qstn_id: question._id,
                                text: question.text,
                                type: question.type,
                                options: question.options,
                                value: []
                            }
                            $scope.changedPracticeId1 = function (index, text, $event) {
                                console.log(text);
                                var checkbox = $event.target;
                                if (checkbox.checked) {
                                    text.value = [];
                                    text.value.push(text.options[index]);
                                } else {
                                    text.value.splice(text.options[index], 1);
                                }
                            }
                        }
                        answers.push(ans);
                    }
                });
            });

            var newFBObject = {
                _id: returnedFeedback.response._id,
                qsnr_id: returnedFeedback.questionnaire._id,
                user: returnedFeedback.user,
                answers: answers
            }
            mainFBObject = newFBObject;
            $scope.feedbackObject = newFBObject;
            console.log("New FB: ", newFBObject);
        });
    }

    $scope.startFB = function () {
        $scope.showFB = true;
        console.log("Starting FB");
        console.log("Feedback Object is : ", mainFBObject);
    }

    $scope.submitFeedback = function () {
        var finalResponse = {
            response: {}
        };
        var tempObj = $scope.feedbackObject;
        var user_id = tempObj.user._id;
        var qsnr_id = tempObj.qsnr_id;
        var answers = [];
        var qstn_id;
        tempObj.answers.forEach(function(ans) {
            var value = [];
            qstn_id = ans.qstn_id;
            if(ans.value.constructor === Array) {
                ans.value.forEach(function(val) {
                    value.push(val);
                });
            }
            else
                value.push(ans.value);
            answers.push({
                qstn_id: qstn_id,
                value: value
            });
        });
        finalResponse.response.user_id = user_id;
        finalResponse.response.qsnr_id = qsnr_id;
        finalResponse.response.answers = answers;

        MainService.update('responses', tempObj._id, finalResponse).then(function (data) {
            console.log("Database Updated as : ", data);
        });

        console.log("AS", finalResponse);
        console.log("Submit Button Clicked!");
        console.log($scope);
        console.log($scope.feedbackObject);
    }
}]);
