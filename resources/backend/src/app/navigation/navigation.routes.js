'use strict';

angular.module('ngAdmin')
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
	  .state('app.navigation', {
        url: '/navigation',
		abstract: true,
        templateUrl: 'app/viewer.html'
      })  
	  .state('app.navigation.index', {
        url: '/index',
        templateUrl: 'app/navigation/navigation.html',
		controller: 'NavigationCtrl'
      })
	  .state('app.navigation.edit', {
        url: '/edit',
        templateUrl: 'app/navigation/navigation-edit.html',
        controller: 'NavigationEditCtrl'
      });

  })
;
