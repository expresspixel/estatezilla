'use strict';

angular.module('ngAdmin')
  .config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
    .state('app.members', {
      url: '/members',
      abstract: true,
      templateUrl: 'app/viewer.html'
    })  
    .state('app.members.index', {
      url: '/list/:memberType',
      templateUrl: 'app/members/members.html',
      controller: 'MembersCtrl'
    })
    .state('app.members.create', {
      url: '/create',
      templateUrl: 'app/members/members-edit.html',
      controller: 'MembersCreateCtrl'
    })
    .state('app.members.edit', {
      url: '/edit/:memberId',
      templateUrl: 'app/members/members-edit.html',
      controller: 'MembersEditCtrl'
    });
    
});