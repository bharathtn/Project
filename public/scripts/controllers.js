'use strict';

/* Controllers */

angular.module('MainApps')
    .controller('HomeCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'MainService', function ($rootScope, $scope, $location, $localStorage, MainService) {
        $scope.showMainApp = true;
        var currentUser;
        var changeLocation = function (url, replace, forceReload) {
            $scope = $scope || angular.element(document).scope();
            if (forceReload || $scope.$$phase) {
                window.location = url;
            }
            if (replace) {
                $location.path(url).replace();
            } else {
                //this this if you want to change the URL and add it to the history stack
                $location.path(url);
            }
        };

        $scope.signin = function () {
            var inData = {
                user: {
                    email: $scope.email,
                    password: $scope.password
                }
            };

            MainService.signin(inData).then(function (res) {
                console.log("Signing in.");

                if (res.type == false) {
                    alert(res.data)
                } else {
                    $localStorage.token = res.data.token;
                    $rootScope.token = $localStorage.token;
                    $rootScope.currentUser = res.data.user;
                    /*
                                        MainService.changeUser(res.data.user);
                    */
                    changeLocation('#/', true, false);
                }
            }, function () {
                $rootScope.error = 'Failed to signin';
            });
        };

        $scope.signup = function () {
            var inData = {
                user: {
                    firstname: $scope.firstname,
                    lastname: $scope.lastname,
                    email: $scope.email,
                    password: $scope.password
                }
            };

            MainService.signup(inData).then(function (res) {
                if (res.type == false) {
                    alert(res.data)
                } else {
                    alert("Signed up. Please Login");
                    changeLocation('#/signin', true, false);
                }
            }, function () {
                $rootScope.error = 'Failed to signup';
            });
        };


        $scope.logout = function () {
            MainService.logout(function () {
                delete $rootScope.token;
                delete $rootScope.currentUser;
                changeLocation('#/');
            }, function () {
                alert("Failed to logout!");
            });
        };
        $rootScope.token = $localStorage.token;
        $rootScope.currentUser = MainService.getCurrentUser();
    }])

.controller('UsersCtrl', ['$rootScope', '$scope', '$location', 'MainService', 'DS', function ($rootScope, $scope, $location, MainService, DS) {
    $scope.total = 0;
    $scope.page = 1;
    $scope.limit = 5;

    $scope.pagination = {
        current: 1
    };

    $scope.pageChanged = function (newPage) {
        console.log("Current User is : ", $rootScope.currentUser);
        DS.findAll('usersResource', {
            page: newPage,
            limit: $scope.limit
        }, {
            deserialize: function (resource, data) {
                $scope.total = data.data.meta.total;
                return data.data.users;
            }
        }).then(function (users) {
            $scope.users = users;
            $rootScope.currentUser = MainService.getCurrentUser();
        }, function () {
            $rootScope.error = 'Failed to fetch users';
        });
    }
    $scope.pageChanged($scope.page, $scope.limit);
}])

.controller('QuestionsCtrl', ['$rootScope', '$scope', '$location', 'MainService', 'DS', function ($rootScope, $scope, $location, MainService, DS) {
    $scope.total = 0;
    $scope.page = 1;
    $scope.limit = 5;

    $scope.pageChanged = function (newPage) {
        DS.findAll('questionsResource', {
            page: newPage,
            limit: $scope.limit
        }, {
            deserialize: function (resource, data) {
                $scope.total = data.data.meta.total;
                return data.data.questions;
            }
        }).then(function (questions) {
            questions.forEach(function (qstn) {
                if (qstn.type == "MCQN" || qstn.type == "mcqn") {
                    qstn.type = "checkbox";
                } else if (qstn.type == "MCQ1" || qstn.type == "mcq1") {
                    qstn.type = "radio";
                } else if (qstn.type == "TEXT" || qstn.type == "text") {
                    qstn.type = "text";
                } else if (qstn.type == "RATE" || qstn.type == "rate") {
                    qstn.type = "radio";
                    qstn.options = [];
                    qstn.options.push("1", "2", "3", "4", "5");
                }
            });
            $scope.questions = questions;
        }, function () {
            $rootScope.error = 'Failed to fetch questions';
        });
    };
    $scope.pageChanged($scope.page, $scope.limit);

    $scope.setQID = function (qID) {
        MainService.setID(qID);
        $location.path("/questions/details");
    };

    var qID = MainService.getID();
    console.log(qID);
    var questions;

    DS.find('questionsResource', qID, {
        deserialize: function (resource, data) {
            return data.data.questions;
        }
    }).then(function (selectedQstn) {
        console.log("Selected Question : ", selectedQstn);
        if (selectedQstn.type == "MCQN" || selectedQstn.type == "mcqn") {
            selectedQstn.type = "checkbox";
        } else if (selectedQstn.type == "MCQ1" || selectedQstn.type == "mcq1") {
            selectedQstn.type = "radio";
        } else if (selectedQstn.type == "TEXT" || selectedQstn.type == "text") {
            selectedQstn.type = "text";
        } else if (selectedQstn.type == "RATE" || selectedQstn.type == "rate") {
            selectedQstn.type = "radio";
            selectedQstn.options = [];
            selectedQstn.options.push("1", "2", "3", "4", "5");
        }
        $scope.question = selectedQstn;
    });

    $scope.updateOption = function (option) {
        var options = $scope.question.option;
        console.log("OPTIONS: ", options);
        var questns = {
            question: $scope.question
        }
        MainService.update('questions', qID, questns);
        console.log("Question Updated Successfully");
        $location.path("/questions");
    };

    $scope.save = function (qID) {
        var options = $scope.question.option;
        console.log("OPTIONS: ", options);
        var questns = {
            question: $scope.question
        }
        MainService.update('questions', qID, questns);
        console.log("Question Updated Successfully");
        $location.path("/questions");
    };

    $scope.delete = function (qID) {
        MainService.delete('questions', qID);
        console.log("Question Deleted Successfully");
        $location.path("/questions");
    };

    $scope.returnToQuestions = function () {
        $location.path("/questions");
    }
}])

.controller('QuestionnaireCtrl', ['$rootScope', '$scope', '$location', 'MainService', 'DS', function ($rootScope, $scope, $location, MainService, DS) {
    $scope.total = 0;
    $scope.page = 1;
    $scope.limit = 5;

    $scope.pageChanged = function (newPage) {
        DS.findAll('questionnaireResource', {
            page: newPage,
            limit: $scope.limit
        }, {
            deserialize: function (resource, data) {
                $scope.total = data.data.meta.total;
                return data.data.questionnaires;
            }
        }).then(function (questionnaires) {
            $scope.questionnaires = questionnaires;
        }, function () {
            $rootScope.error = 'Failed to fetch questions';
        });
    };
    $scope.pageChanged($scope.page, $scope.limit);

    $scope.setQID = function (qID) {
        MainService.setID(qID);
        $location.path("/questionnaire/details");
    };

    var qID = MainService.getID();
    var questionnaires;

    DS.find('questionnaireResource', qID, {
        deserialize: function (resource, data) {
            return data.data.questionnaires;
        }
    }).then(function (selectedQstnr) {
        selectedQstnr.questions.forEach(function (qstn) {
            if (qstn.type == "MCQN" || qstn.type == "mcqn") {
                qstn.type = "checkbox";
            } else if (qstn.type == "MCQ1" || qstn.type == "mcq1") {
                qstn.type = "radio";
            } else if (qstn.type == "TEXT" || qstn.type == "text") {
                qstn.type = "text";
            } else if (qstn.type == "RATE" || qstn.type == "rate") {
                qstn.type = "radio";
                qstn.options = [];
                qstn.options.push("1", "2", "3", "4", "5");
            }
        });
        $scope.questionnaire = selectedQstnr;
    });

    $scope.setQuestionID = function (qID) {
        MainService.setID(qID);
        $location.path("/questions/details");
    };

    $scope.delete = function (qID) {
        MainService.delete('questionnaires', qID).then(function () {
            console.clear();
            console.log("Questionnaire Deleted Successfully");
        });
        $location.path("/questionnaire");
    };

    var qsnrID;
    var mailingUserID;
    $scope.showReceivers = false;

    $scope.send = function (qID) {
        $scope.showReceivers = true;
        qsnrID = qID;
        console.log("Questionnaire ID: ", qID);
        var currentUser = MainService.getCurrentUser();
        console.log("currentUser : ", currentUser);

        var mailingusers = [{}];

        MainService.findAll('mailinglists', 1, 100).then(function (lists) {
            console.log(lists);
            lists.data.mailinglists.forEach(function (list) {
                if (list.user_id == currentUser.email) {
                    list.people.forEach(function (user_id) {
                        MainService.find('mailingusers', user_id).then(function (users) {
                            console.log(users.data.mailinguser);
                            mailingusers.push(users.data.mailinguser);
                        });
                    });
                }
            });
        });

        console.log("MU", mailingusers);
        $scope.mailingusers = mailingusers;
    };

    function getMailingUser(mailingUserID) {
        return DS.get('mailingusersResource', mailingUserID, {
            deserialize: function (resource, data) {
                return data.data.mailinguser;
            }
        });
    }

    $scope.sendToSelected = function (mUID, name, email) {
        var fname = name.split(' ')[0];
        var objectToSend = {
            "name": fname,
            "email": email,
            "uid": mUID,
            "qid": qsnrID
        }

        MainService.findResponse('responses', qsnrID, mUID).then(function (data) {
            console.log("Response Object already exists.");
        }, function (err) {
            DS.find('questionnaireResource', qsnrID, {
                deserialize: function (resource, data) {
                    return data.data.questionnaires;
                }
            }).then(function (selectedQstnr) {
                var newResponse = {};
                var answers = [];
                selectedQstnr.questions.forEach(function (qstn) {
                    answers.push({
                        qstn_id: qstn._id,
                        value: [""]
                    });
                });
                newResponse = {
                    response: {
                        user_id: mUID,
                        qsnr_id: qsnrID,
                        answers: answers
                    }
                }
                MainService.save('responses', newResponse).then(function (data) {
                    console.log("Returned response is: ", data);
                });
                console.log("New Response is : ", newResponse);
            });
            console.log("Error Occurred: ", err);
        }).then(function () {
            MainService.sendEmail('send', objectToSend).then(function (data) {
                console.log("Sent Mail is : ", data);
            }, function (err) {
                console.log("Error occurred : ", err);
            });
        });
    };

    $scope.returnToQuestionnaires = function () {
        $location.path("/questionnaire");
    }
}])


.controller('CreateQuestionsCtrl', ['$scope', 'MainService', function ($scope, MainService) {
    $scope.showDropdown = false;
    $scope.showSubmit = false;
    var count = 0;
    $scope.addDynamically = function () {
        $('.btn-hover').css('background-color', '#428BCA');
        $('.btn-hover > i').css('color', 'white');
        $scope.showDropdown = true;
    };

    var inData = [];
    //    console.log(inData);

    $scope.elements = [{
        'text1': []
    }, {
        'mcq1': []
    }, {
        'mcqn': []
    }, {
        'rate': []
    }];

    $scope.addEl = function (type) {
        console.log($scope.elements);
        if (type === 'TEXT') {

            $scope.elements[0].text1.push({
                'id': Math.random(),
                'opt': [],
                'question': ""
            })
        }
        if (type === 'MCQ1')
            $scope.elements[1].mcq1.push({
                'id': Math.random(),
                'opt': [],
                'question': "",
            })
        if (type === 'MCQN')
            $scope.elements[2].mcqn.push({
                'id': Math.random(),
                'opt': [],
                'question': "",
            })
        if (type === 'RATE')
            $scope.elements[3].rate.push({
                'id': Math.random(),
                'opt': [],
                'question': "",
            })
        $scope.showSubmit = true;
    }

    $scope.removeItemOption = function (option, ind) {
        option.splice(ind, 1);
    }

    var questionsArr = [];

    $scope.saveItemText = function (elem, ind) {
        var saveIt = {
            question: {
                type: "text",
                text: elem.question,
                options: [""]
            }
        };

        MainService.save('questions', saveIt).then(function (data) {
            console.log("Data is : ", data);
            console.log("ID is ", data.data.question._id);
            questionsArr.push(data.data.question._id);
            console.log("questionsArr", questionsArr);
        }, function (err) {
            console.log("Error is : ", err);
        });
        console.log(saveIt);
    }

    $scope.deleteItemText = function (elem, ind) {
        $scope.elements[0].text1.splice(ind, 1);
    }

    $scope.saveItemMcq1 = function (elem, ind) {
        var options = [];
        count++;
        elem.opt.forEach(function (optn) {
            optn.optionsArray.forEach(function (op) {
                console.log(op)
                options.push(op.option1);
            });
        });

        var saveIt = {
            question: {
                type: "mcq1",
                text: elem.question,
                options: options,
            }
        };
        console.log(saveIt);

        MainService.save('questions', saveIt).then(function (data) {
            console.log("Data is : ", data);
            console.log("ID is ", data.data.question._id);
            questionsArr.push(data.data.question._id);
            console.log("questionsArr", questionsArr);
        }, function (err) {
            console.log("Error is : ", err);
        });
    }

    $scope.deleteItemMcq1 = function (elem, ind) {
        $scope.elements[1].mcq1.splice(ind, 1);

    }

    $scope.saveItemMcqn = function (elem, ind) {
        var options = [];
        count++;
        elem.opt.forEach(function (optn) {
            optn.optionsArray.forEach(function (op) {
                console.log(op)
                options.push(op.option1);
            });
        });
        var saveIt = {
            question: {
                type: "mcqn",
                text: elem.question,
                options: options,
            }
        };
        console.log(saveIt);

        MainService.save('questions', saveIt).then(function (data) {
            console.log("Data is : ", data);
            console.log("ID is ", data.data.question._id);
            questionsArr.push(data.data.question._id);
            console.log("questionsArr", questionsArr);
        }, function (err) {
            console.log("Error is : ", err);
        });
    }

    $scope.deleteItemMcqn = function (elem, ind) {
        $scope.elements[2].mcqn.splice(ind, 1);
    }

    $scope.saveItemRate = function (elem, ind) {
        var saveIt = {
            question: {
                type: "rate",
                text: elem.question,
                options: [""]
            }
        };
        console.log(saveIt);

        MainService.save('questions', saveIt).then(function (data) {
            console.log("Data is : ", data);
            console.log("ID is ", data.data.question._id);
            questionsArr.push(data.data.question._id);
            console.log("questionsArr", questionsArr);
        }, function (err) {
            console.log("Error is : ", err);
        });
    }

    $scope.deleteItemRate = function (elem, ind) {
        $scope.elements[3].rate.splice(ind, 1);
    }

    $scope.addOptions = function (element) {
        element.opt.push({
            id: Math.random(),
            optionsArray: [{
                'option1': ""
            }]
        })
    }

    $scope.addvalue = function () {
        var questionnaireName = $scope.questionnaireName;
        console.log("questionnaireName", questionnaireName);
        console.log("questionsArr", JSON.stringify(questionsArr, null, ' '));
        var questionnaire = {
            questionnaire: {
                name: questionnaireName,
                questions: questionsArr
            }
        };
        console.log("Saving Questionnaire: ", JSON.stringify(questionnaire, null, ' '));
        MainService.save('questionnaires', questionnaire).then(function (data) {
            console.log("Saved Questionnaire", data);
        }, function (err) {
            console.log("Error is: ", err);
        });
        var ele = $scope.elements;
        var i = 0;
        var options = [];
        console.log("qType = ", Object.keys(ele[1])[0]);
        console.log(Object.keys(ele[1])[0] == 'mcq1');

        ele.forEach(function (elmt) {
            console.log("Elements:", Object.keys(elmt)[0]);
            if (Object.keys(elmt)[0] == 'mcq1') {
                elmt.mcq1.forEach(function (qstn) {
                    options = [];
                    count++;
                    qstn.opt.forEach(function (optn) {
                        optn.optionsArray.forEach(function (op) {
                            console.log(op)
                            options.push(op.option1);
                        });
                    });
                    inData.push({
                        type: "mcq1",
                        text: qstn.question,
                        options: options,
                    })
                });
            } else if (Object.keys(elmt)[0] == 'text1') {
                //count++;
                console.log("Text given", elmt.text1)
                elmt.text1.forEach(function (t) {
                    console.log(t.question)
                    count++;
                    inData.push({

                        type: "text",
                        text: t.question,
                        options: [""]
                    })
                });
            } else if (Object.keys(elmt)[0] == 'mcqn') {
                elmt.mcqn.forEach(function (qstn) {
                    options = [];
                    qstn.opt.forEach(function (optn) {
                        optn.optionsArray.forEach(function (op) {
                            console.log(op)
                            options.push(op.option1);
                        });
                    });
                    inData.push({
                        type: "mcqn",
                        text: qstn.question,
                        options: options,

                    })
                });
            } else if (Object.keys(elmt)[0] == 'rate') {
                //count++;
                console.log("Text given", elmt.text1)
                elmt.rate.forEach(function (t) {
                    console.log(t.question)
                    count++;
                    inData.push({
                        type: "rate",
                        text: t.question,
                        options: [""]
                    })
                });
            }
        });
        console.log("All Options: ", options);
        console.log(inData);

        function findAndRemove(elements, option1, value) {
            array.forEach(function (result, index) {
                if (result[property] === value) {
                    //Remove from array
                    array.splice(index, 1);
                }
            });
        }
    }

    $scope.showitems = function ($event) {
        $('#displayitems').css('visibility', 'none');
    }
}])


.controller('MailinglistsCtrl', ['$rootScope', '$scope', 'DS', 'MainService', function ($rootScope, $scope, DS, MainService) {
    $scope.isToBeDisplayed = false;
    var currentUser = MainService.getCurrentUser();
    var selectedMailingList;

    DS.findAll('mailinglistsResource', {
        page: 1,
        limit: 100
    }, {
        deserialize: function (resource, data) {
            return data.data.mailinglists;
        }
    }).then(function (mailinglists) {
        console.log("ML", mailinglists);
        var people;
        mailinglists.forEach(function (mails) {
            if (mails.user_id == currentUser.email) {
                selectedMailingList = mails;
                $scope.mailingusers = mails.people;
                console.log("Selected MailingList", mails);
            }
        });
        $scope.mailinglists = mailinglists;
        console.log("All MailingLists", mailinglists);
    }, function () {
        $rootScope.error = 'Failed to fetch questions';
    });

    $scope.addNew = function () {
        $scope.isToBeDisplayed = true;
    }

    $scope.save = function () {
        var mailingUser = {
            mailinguser: {
                name: $scope.name,
                email: $scope.email
            }
        };

        console.log(mailingUser);
        console.log("currentUser : ", currentUser);
        console.log("selectedList : ", JSON.stringify(selectedMailingList, null, ' '));
        var people = [];

        if (selectedMailingList != undefined) {
            selectedMailingList.people.forEach(function (person) {
                people.push(person._id);
            });
        }

        MainService.save('mailingusers', mailingUser).then(function (data) {
            console.log("Returned Data is : ", data);
            people.push(data.data.mailinguser._id);
            console.log("People are: ", people);

            console.log("newML: ", newMailingList);

            if (selectedMailingList == undefined) {
                var newMailingList = {
                    mailinglist: {
                        name: "New List",
                        user_id: currentUser.email,
                        people: people
                    }
                }
                MainService.save("mailinglists", newMailingList).then(function (data) {
                    console.log("Data is: ", data);
                }, function (err) {
                    console.log("Error is : ", err);
                });
            } else {
                var newMailingList = {
                    mailinglist: {
                        name: selectedMailingList.name,
                        user_id: selectedMailingList.user_id,
                        people: people
                    }
                }
                MainService.update('mailinglists', selectedMailingList._id, newMailingList).then(function (data) {
                    console.log("Returned ML: ", data);
                });
            }
        }, function (err) {
            console.log("Error is : ", err);
        });
    }

    $scope.delete = function (mUID) {
        MainService.delete('mailingusers', mUID);
        console.log("Contact Deleted Successfully");
        $location.path("/mailinglist");
    };

    /*
        DS.findAll('mailinglistsResource', {
            page: 1,
            limit: $scope.limit
        }, {
            deserialize: function (resource, data) {
                return data.data.mailinglists;
            }
        }).then(function (mailinglists) {
            console.log("Mailing Lists: ", mailinglists);
            $scope.mailinglists = mailinglists;
        }, function () {
            $rootScope.error = 'Failed to fetch questions';
        });
    */
}])


.controller('ResponsesCtrl', ['$rootScope', '$scope', '$location', 'DS', 'MainService', function ($rootScope, $scope, $location, DS, MainService) {
    var currentUser = MainService.getCurrentUser();
    var selectedMailingList;
    var mIDs = [];
    $scope.hideMain = false;

    var clients = [];
    MainService.findAllResponses('responses', currentUser.email).then(function (data) {
        console.log("All responses are : ", data);
        var response = data.data.data;
        console.log(response);
        var finalResponse = [];
        var ctrID = 0;

        response.mailinglist.people.forEach(function (person) {
            response.response.forEach(function (resp) {
                if (person._id == resp.user_id) {
                    response.questionnaire.forEach(function (qsnr) {
                        var options = [];
                        if (qsnr._id == resp.qsnr_id) {
                            var answers = [];
                            var qstns = [];
                            qsnr.questions.forEach(function (qstnInQsnr) {
                                response.questions.forEach(function (qstnInQsns) {
                                    if (qstnInQsnr == qstnInQsns._id) {
                                        qstns.push(qstnInQsns);
                                    }
                                });
                            });
                            /*
                                                        for (var i = 0; i < qstns.length; i++) {
                                                            for (var j = 0; j < resp.length; j++) {
                                                                if (qstns[i]._id == resp[j].qstn_id) {
                                                                    answers.push({
                                                                        text: qstn.text,
                                                                        type: qstn.type,

                                                                                                                    options: options


                                                                        options: qstn[i].options,
                                                                        value: resp[j].value

                                                                    });
                                                                }
                                                            }
                                                        }
                            */
                            qstns.forEach(function (qstn) {
                                resp.answers.forEach(function (ans) {
                                    if (ans.qstn_id == qstn._id) {
/*
                                        if (options.length == 0) {
                                            options.push({
                                                option: qstn.options,
                                                value: ans.value
                                            });
                                        }
*/
                                        answers.push({
                                            text: qstn.text,
                                            type: qstn.type,
/*
                                            options: options,
*/

                                            options: qstn.options,
                                            value: ans.value

                                        });
                                    }
                                })
                            });
                            finalResponse.push({
                                _id: ctrID,
                                user: person,
                                questionnaire: qsnr,
                                answers: answers
                            });
                            ctrID++;
                            /*
                                                        console.log("Matched Response is: ", resp);
                                                        console.log("Matched Person is: ", person);
                                                        console.log("Matched Qsnr is : ", qsnr);
                                                        console.log("Matched Questions Are: ", qstns);
                                                        console.log("Answers Are: ", answers);
                            */
                        }
                    });
                }
            });
        });
        console.log("Final Response is : ", finalResponse);
        $scope.responses = finalResponse;

        $scope.showDetails = function (responseID) {
            $scope.hideMain = true;
            finalResponse.forEach(function (response) {
                if (response._id == responseID) {
                    $scope.selectedResponse = response;
                    console.clear();
                    console.log("Selected Response is : ", response);
                }
            });
            //            $location.path("/responses/details");
        }

        $scope.returnToResponses = function () {
            $scope.hideMain = false;
        }
    });

}])


.controller('FeedbackCtrl', ['$rootScope', '$scope', 'DS', 'MainService', function ($rootScope, $scope, DS, MainService) {}]);
