'use strict';

angular.module('ngAdmin')
.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('app.regions', {
        url: '/regions',
        abstract: true,
        templateUrl: 'app/viewer.html',
        data: {
            requireLogin: true
        }
    })  
    .state('app.regions.index', {
        url: '/index',
        templateUrl: 'app/regions/regions.html',
        controller: 'RegionsCtrl',
        data: {
            requireLogin: true
        }
    })    
    .state('app.regions.create', {
        url: '/create',
        templateUrl: 'app/regions/regions-edit.html',
        controller: 'RegionsCreateCtrl'
    })
    .state('app.regions.edit', {
        url: '/edit/:regionId',
        templateUrl: 'app/regions/regions-edit.html',
        controller: 'RegionsEditCtrl'
    });

});
