'use strict';

angular.module('ngAdmin')
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
	  .state('app.languages', {
        url: '/languages',
		abstract: true,
        templateUrl: 'app/viewer.html'
      })  
	  .state('app.languages.index', {
        url: '/index',
        templateUrl: 'app/languages/languages.html',
		controller: 'LanguagesCtrl'
      })
	  .state('app.languages.edit', {
        url: '/edit',
        templateUrl: 'app/languages/languages-edit.html',
        controller: 'LanguagesEditCtrl'
      });

  })
;
