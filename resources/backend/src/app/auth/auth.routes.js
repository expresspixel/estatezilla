'use strict';

angular.module('ngAdmin')
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
	  .state('auth', {
        url: '/auth',
        templateUrl: 'app/viewer.html'
      })  
	  .state('auth.login', {
        url: '/login',
        templateUrl: 'app/auth/auth.html',
		    controller: 'AuthCtrl'
      });

    //$urlRouterProvider.otherwise('/');
  })
;
