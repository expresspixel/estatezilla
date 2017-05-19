'use strict';

angular.module('ngAdmin')
.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('app.pages', {
        url: '/pages',
        abstract: true,
        templateUrl: 'app/viewer.html',
        data: {
            requireLogin: true
        }
    })  
    .state('app.pages.index', {
        url: '/index',
        templateUrl: 'app/pages/pages.html',
        controller: 'PagesCtrl',
        data: {
            requireLogin: true
        }
    })    
    .state('app.pages.create', {
        url: '/create',
        templateUrl: 'app/pages/pages-edit.html',
        controller: 'PagesCreateCtrl'
    })
    .state('app.pages.edit', {
        url: '/edit/:pageId/:locale',
        templateUrl: 'app/pages/pages-edit.html',
        controller: 'PagesEditCtrl'
    });

});
