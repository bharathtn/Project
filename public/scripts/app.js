'use strict';

angular.module('MainApps', [
    'angularUtils.directives.dirPagination',
    'ngStorage',
    'ngRoute',
    'angular-loading-bar',
    'js-data'
])
    .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'partials/home.html',
                controller: 'HomeCtrl'
            }).
            when('/signin', {
                templateUrl: 'partials/signin.html',
                controller: 'HomeCtrl'
            }).
            when('/signup', {
                templateUrl: 'partials/signup.html',
                controller: 'HomeCtrl'
            }).
            when('/users', {
                templateUrl: 'partials/users.html',
                controller: 'HomeCtrl'
            }).
            when('/questions', {
                templateUrl: 'partials/questions.html',
                controller: 'HomeCtrl'
            }).
            when('/questions/details', {
                templateUrl: 'partials/questionsDetails.html',
                controller: 'HomeCtrl'
            }).
            when('/questionnaire', {
                templateUrl: 'partials/questionnaire.html',
                controller: 'HomeCtrl'
            }).
            when('/questionnaire/details', {
                templateUrl: 'partials/questionnaireDetails.html',
                controller: 'HomeCtrl'
            }).
            when('/createQuestions', {
                templateUrl: 'partials/createQuestions.html',
                controller: 'HomeCtrl'
            }).
            when('/mailinglist', {
                templateUrl: 'partials/mailinglist.html',
                controller: 'HomeCtrl'
            }).
            when('/responses', {
                templateUrl: 'partials/responses.html',
                controller: 'HomeCtrl'
            }).
/*
            when('/responses/details', {
                templateUrl: 'partials/responseDetails.html',
                controller: 'HomeCtrl'
            }).
*/
            when('/takefeedback', {
                templateUrl: 'partials/takefeedback.html',
                controller: 'ClientCtrl'
            }).
            otherwise({
                redirectTo: '/'
            });

        $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function ($q, $location, $localStorage) {
            return {
                'request': function (config) {
                    config.headers = config.headers || {};

                    if ($localStorage.token) {
                        config.headers['x-access-token'] = $localStorage.token;
                    }
                    return config;
                },
                'responseError': function (response) {
                    if (response.status === 401 || response.status === 403) {
                        $location.path('/signin');
                    }
                    return $q.reject(response);
                }
            };
        }]);
    }
]);
