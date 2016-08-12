'use strict';

angular.module('MainApps')

.run(function (DS) {
    var UsersResource = DS.defineResource({
        name: 'usersResource',
        idAttribute: '_id',
        endpoint: 'api/users',
    });

    var QuestionsResource = DS.defineResource({
        name: 'questionsResource',
        idAttribute: '_id',
        endpoint: 'api/questions',
    });

    var QuestionnaireResource = DS.defineResource({
        name: 'questionnaireResource',
        idAttribute: '_id',
        endpoint: 'api/questionnaires',

        afterInject: function (resource, attrs) {
            function loadQuestions(item) {
                var qstns = item.questions.slice();
                item.questions = [];
                qstns.forEach(function (qstn) {
                    DS.find('questionsResource', qstn, {
                        deserialize: function (resource, data) {
                            return data.data.question;
                        }
                    }).then(function (data) {
                        item.questions.push(data);
                    }, function (err) {
                        console.log("Error = ", err);
                    });
                });
            }
            //deals with findAll()
            if (attrs instanceof Array) {
                attrs.forEach(function (item) {
                    loadQuestions(item);
                });
            }
            //deals with find()
            else {
                attrs.questions.forEach(function () {
                    loadQuestions(attrs);
                });
            }
        }
    });
        /*afterInject: function (resource, attrs) {
            function loadQuestions(item) {
                var qstns = item.questions.slice();
                item.questions = [];
                qstns.forEach(function (qstn) {
                    DS.find('questionsResource', qstn, {
                        deserialize: function (resource, data) {
                            return data.data.question;
                        }
                    }).then(function (data) {
                        item.questions.push(data);
                        console.log("Qq: ", item);
                    }, function (err) {
                        console.log("Error = ", err);
                    });
                });
            }
            //deals with findAll()
            if (attrs instanceof Array) {
                attrs.forEach(function (item) {
                    loadQuestions(item);
                });
            }
            //deals with find()
            else {
                attrs.questions.forEach(function () {
                    loadQuestions(attrs);
                });
            }
        }
    });*/

    var MailingUsersResource = DS.defineResource({
        name: 'mailingusersResource',
        idAttribute: '_id',
        endpoint: 'api/mailingusers',
    });

    var MailingListsResource = DS.defineResource({
        name: 'mailinglistsResource',
        idAttribute: '_id',
        endpoint: 'api/mailinglists',

        afterInject: function (resource, attrs) {
            function loadMailingUsers(item) {
                var ppls = item.people.slice();
                item.people = [];
                ppls.forEach(function (ppl) {
                    DS.find('mailingusersResource', ppl, {
                        deserialize: function (resource, data) {
                            return data.data.mailinguser;
                        }
                    }).then(function (data) {
                        item.people.push(data);
                    }, function (err) {
                        console.log("Error = ", err);
                    });
                });
            }
            //deals with findAll()
            if (attrs instanceof Array) {
                attrs.forEach(function (item) {
                    loadMailingUsers(item);
                });
            }
            //deals with find()
            else {
                attrs.mailingusers.forEach(function () {
                    loadMailingUsers(attrs);
                });
            }
        }
    });

    var ResponseResource = DS.defineResource({
        name: 'responseResource',
        idAttribute: '_id',
        endpoint: 'api/responses',

        afterInject: function (resource, attrs) {
            console.log(attrs);
        }
/*
            function loadQuestions(item) {
                var qstns = item.questions.slice();
                item.questions = [];
                qstns.forEach(function (qstn) {
                    DS.find('questionsResource', qstn, {
                        deserialize: function (resource, data) {
                            return data.data.question;
                        }
                    }).then(function (data) {
                        item.questions.push(data);
                    }, function (err) {
                        console.log("Error = ", err);
                    });
                });
            }
            //deals with findAll()
            if (attrs instanceof Array) {
                attrs.forEach(function (item) {
                    loadQuestions(item);
                });
            }
            //deals with find()
            else {
                attrs.questions.forEach(function () {
                    loadQuestions(attrs);
                });
            }
        }
*/
    });
})


.factory('MainService', ['$rootScope', '$http', '$localStorage', '$timeout', '$q', function ($rootScope, $http, $localStorage, $timeout, $q) {
    var baseUrl = "/api";

    function changeUser(user) {
        angular.extend(currentUser, user);
    }

    function urlBase64Decode(str) {
        var output = str.replace('-', '+').replace('_', '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw 'Illegal base64url string!';
        }
        return window.atob(output);
    }

    function getUserFromToken() {
        var token = $localStorage.token;
        var user = {};
        if (typeof token !== 'undefined') {
            var encoded = token.split('.')[1];
            user = JSON.parse(urlBase64Decode(encoded));
        }
        return user;
    }

    var currentUser = getUserFromToken();
    var saveID = {}

    return {
        signup: function (data) {
            return $http.post(baseUrl + '/signup', data);
        },
        signin: function (data) {
            return $http.post(baseUrl + '/authenticate', data).then(function success(res) {
                $localStorage.token = res.data.token;
                $rootScope.token = $localStorage.token;
                $rootScope.currentUser = res.data.user;
                changeUser(res.data.user);
                return res;
            }, function (err) {
                $q.reject(err);
            });
        },
        users: function () {
            return $http.get(baseUrl + '/users');
        },
        delete: function (resource, id) {
            return $http.delete(baseUrl + '/' + resource + '/' + id);
        },
        update: function (resource, id, data) {
            return $http.put(baseUrl + '/' + resource + '/' + id, data);
        },
        questions: function (page, limit) {
            var qString = '' + (page ? (limit ? 'page=' + page + '&limit=' + limit : 'page=' + page) : (limit ? 'limit=' + limit : ''));
            return $http.get(baseUrl + '/questions' + (qString ? '/?' + qString : ''));
        },
        save: function (resource, data) {
            return $http.post(baseUrl + '/' + resource, data);
        },
        sendEmail: function (resource, data) {
            return $http.post(resource, data);
        },
        getCurrentUser: function () {
            return currentUser;
        },
        logout: function (success) {
            changeUser({});
            delete $localStorage.token;
            $timeout(function () {
                success();
            }, 110);
        },
        findResponse: function (resource, qid, uid) {
            return $http.get(baseUrl + '/' + resource + '/' + qid + '/' + uid);
        },
        findAllResponses: function (resource, currentUserID) {
            return $http.get(resource + '/' + currentUserID);
        },
        find: function (resource, id) {
            return $http.get(baseUrl + '/' + resource + '/' + id);
        },
        findAll: function (resource, page, limit) {
            if (page == undefined)
                page = 1;
            if (limit == undefined)
                limit = 100;
            var config = {
                params: {}
            };
            if (page) {
                config.params.page = page;
            }
            if (limit) {
                config.params.limit = limit
            }
            return $http.get(baseUrl + '/' + resource, config);
        },
        setID: setID,
        getID: getID
    };

    function setID(data) {
        saveID = data;
    }

    function getID() {
        return saveID;
    }
}]);


/*.factory('AccessResourceService', ['DS', '$scope', function (DS, $scope) {
    return {
        getResource: function (resourceName, newPage, limit) {
            DS.findAll(resourceName, {
                page: newPage,
                limit: limit
            }, {
                deserialize: function (resource, data) {
                    $scope.total = data.data.meta.total;
                    return eval('data.data.' + resourceName);
                }
            }).then(function (fetchedResources) {
                $scope.resources = fetchedResources;
            }, function () {
                $rootScope.error = 'Failed to fetch questions';
            });
        }
    }
}]);*/
