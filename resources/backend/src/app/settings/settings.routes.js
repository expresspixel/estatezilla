'use strict';

angular.module('ngAdmin')
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('app.settings', {
      url: '/settings',
      abstract: true,
      templateUrl: 'app/viewer.html'
    })  
    .state('app.settings.index', {
      url: '/index',
      templateUrl: 'app/settings/settings.html',
      controller: 'SettingsCtrl'
    })
    .state('app.settings.analytics', {
      url: '/analytics',
      templateUrl: 'app/settings/settings-analytics.html',
      controller: 'SettingsAnalyticsCtrl'
    })
    .state('app.settings.properties', {
      url: '/properties',
      templateUrl: 'app/settings/settings-properties.html',
      controller: 'SettingsPropertiesCtrl'
    })    
    .state('app.settings.payments', {
      url: '/payments',
      templateUrl: 'app/settings/settings-payments.html',
      controller: 'SettingsPaymentsCtrl'
    })    
    .state('app.settings.admins', {
      url: '/admins',
      templateUrl: 'app/settings/settings-admins.html',
      controller: 'SettingsAdminsCtrl'
    })    
    .state('app.settings.packages', {
      url: '/packages',
      templateUrl: 'app/settings/settings-packages.html',
      controller: 'SettingsPackagesCtrl'
    })
    .state('app.settings.languages', {
      url: '/languages',
      templateUrl: 'app/settings/settings-languages.html',
      controller: 'SettingsLanguagesCtrl'
    });

    
  })
;
