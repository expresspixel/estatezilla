'use strict';

angular.module('ngAdmin')
  .config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
    .state('app.prospects', {
      url: '/prospects',
      abstract: true,
      templateUrl: 'app/viewer.html'
    })  
    .state('app.prospects.index', {
      url: '/list/:memberType',
      templateUrl: 'app/prospects/prospects.html',
      controller: 'ProspectsCtrl'
    });
    
});