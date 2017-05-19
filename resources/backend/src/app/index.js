'use strict';

var stringjs = angular.module('stringjs', []);
stringjs.factory('S', function() {
    return window.S; // assumes underscore has already been loaded on the page
});

var lodash = angular.module('lodash', []);
lodash.factory('_', function() {
    return window._; // assumes underscore has already been loaded on the page
});

//fetch the API URL
var API_URL = '../';

angular.module('ngAdmin', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'restangular', 'ui.router', 'ui.bootstrap', 'stringjs', 'ng-token-auth', 'angularMoment', 'angular-data.DSCacheFactory', 'ngMessages', 'ngCkeditor', 'lodash', 'ui.ace', 'ui.tree', 'ui.select', 'ngSanitize', 'ngRange', 'ui.bootstrap.datetimepicker', 'ui.dateTimeInput', 'angularFileUpload', 'truncate', 'xeditable', 'ngAnalytics', 'ui.router.stateHelper', 'ct.ui.router.extras', 'formly', 'formlyBootstrap', 'google.places', 'oc.lazyLoad'])
    .config(function ($stateProvider, $urlRouterProvider, $authProvider, RestangularProvider, formlyConfigProvider) {
    $stateProvider

        .state('index', {
        url: '/',
        templateUrl: 'app/index.html',
        controller: function($state, $auth) {
            $auth.validateUser().then(function(user) {
                // if the user is authenticated, redirect to the dashboard
                $state.go('app.properties.index');
            }).catch(function(resp) {
                // handle error response
                $state.go('auth.login');
            });

            // otherwise proceed as normal
        }
    })
	.state('app', {
        url: '/app',
        templateUrl: 'app/main.html',
        controller: 'MainCtrl',
        abstract: true,
        resolve: {
            authorize: function($auth, $state) {
                console.log('app.validateUser', $auth);

                return $auth.validateUser().then(function(user) {
                    // if the user is authenticated, redirect to the dashboard
                    console.log(user);
                }).catch(function(resp) {
                    // handle error response
                    $state.go('auth.login');
                });

                return $auth.validateUser().catch(function(){
                    // redirect unauthorized users to the login page
                    $state.go('auth.login');
                });
            }
        }
    });

    $urlRouterProvider.otherwise('/');

    $authProvider.configure({
        apiUrl: API_URL + 'admin',

        handleLoginResponse: function(resp, $auth) {
            console.log('resp', resp);
            // the persistData method will store the token for subsequent requests.
            // this will be stored using cookies or localStorage depending on your config.
            $auth.persistData('auth_headers', {
                // save the token
                'Authorization': 'Bearer ' + resp['access_token'],
                // convert the expiry value into a date that this module understands
                'expiry': moment().add(resp['expires_in'], 'seconds').valueOf()
            });

            // the object returned by this method will be attached to the $rootScope as
            // the "user" object. The object needs a "uid" value at minimum
            return resp['data'];
        },

        // now that the token expiration date is stored, let the module know
        // where to find it
        parseExpiry: function(headers) {
            return headers['expiry'];
        },

        // this will let the module know what properties to add to subsequent requests
        // to the API
        tokenFormat: function() {
            return {
                'Authorization': 'Bearer {{ token }}'
            };
        },

        handleTokenValidationResponse: function(response) {
            return response.data;
        }

    });


    RestangularProvider.setBaseUrl(API_URL + 'admin/api');
    //RestangularProvider.setDefaultHttpFields({cache: true});
    // add a response intereceptor
    RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
        //console.log(data, operation, what, url, response, deferred);
        var extractedData;
        // .. to look for getList operations
        if (operation === "getList") {
            //cosole.log(data);
            //console.log(extractedData);
            extractedData = data;
            if("data" in data ) {
                extractedData = data.data;
                delete data.data;
                extractedData.meta = data;
            }
            //console.log(typeof extractedData, extractedData);
        } else {
            extractedData = data;
        }
        return extractedData;
    });
    RestangularProvider.setRestangularFields({
        id: 'id'
    });

    // formly
    formlyConfigProvider.setType({
      name: 'custom',
      templateUrl: 'custom.html'
    });

});
angular.module('ngAdmin').run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

angular.module('ngAdmin').config(['$httpProvider', function ($httpProvider) {

    $httpProvider.interceptors.push(['$q', function ($q) {
                var _queue = [];

                /**
                 * Executes the top function on the queue (if any).
                 */
                function _executeTop() {
                    if (_queue.length === 0) {
                        return;
                    }
                    _queue[0]();
                }

                return {
                    /**
                     * Blocks each request on the queue. If the first request, processes immediately.
                     */
                    request: function (config) {
                        if (config.url.substring(0, 4) == 'http') {
                            var deferred = $q.defer();
                            _queue.push(function () {
                                deferred.resolve(config);
                            });
                            if (_queue.length === 1) {
                                _executeTop();
                            }
                            return deferred.promise;
                        } else {
                            return config;
                        }
                    },
                    /**
                     * After each response completes, unblocks the next request.
                     */
                    response: function (response) {
                        if (response.config.url.substring(0, 4) == 'http') {
                            _queue.shift();
                            _executeTop();
                        }
                        return response;
                    },
                    /**
                     * After each response errors, unblocks the next request.
                     */
                    responseError: function (responseError) {
                        if (responseError.config.url.substring(0, 4) == 'http') {
                            _queue.shift();
                            _executeTop();
                        }
                        return $q.reject(responseError);
                    },
                };
            }]);

}]);

angular.module('ngAdmin')
    .run(function($rootScope, $state, $stateParams, S, $auth, $previousState) {


    $previousState.memo("caller");
    window.previousState = $previousState;
    $rootScope.goPrevious = function() {
      $previousState.go('caller');
    };

    $rootScope.API_URL = API_URL;
    $rootScope.pageClass = 'root';
    $rootScope.state = $state;
    $rootScope.S = S;
    window.rootScope = $rootScope;
    window.auth = $auth;

    $rootScope.setPageClass = function(pageClass) {
        $rootScope.pageClass = pageClass
    };

    $rootScope.$on('$routeChangeSuccess', function (ev, next, current) {
        console.log('routeChangeSuccess');
        //flash.error = "You must be an administrator to access that page."
        //$location.path('/')
    });

    $rootScope.$on('$routeChangeError', function (ev, next, current) {
        console.log('Please login.');
    })


    $rootScope.$on('auth:login-success', function(ev, user) {
        console.log('Welcome ', user.email);
    });

    $rootScope.$on('auth:login-error', function(ev, reason) {
        console.log('auth failed because', reason);
    });

    $rootScope.$on('auth:validation-success', function(ev) {
        console.log('auth:validation-success', ev);
        //$state.go('app.dashboard');
    });
    $rootScope.$on('auth:validation-error', function(ev) {
        console.log('auth:validation-error', ev);
        $state.go('auth.index');
    });

    $rootScope.$on('auth:logout-success', function(ev) {
        $state.go('auth.login');
    });



});
