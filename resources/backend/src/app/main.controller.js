'use strict';

angular.module('ngAdmin')
  .controller('MainCtrl', function ($scope, $auth, SettingsService, LanguageService, $rootScope) {

    window.mainScope = $scope;
    $scope.loader = false;
    $scope.loggingOut = false;
    $scope.currentPage = '';
    $scope.currentLocale = 'en';
    $scope.localesList = [];
    $scope.settings = [];

    $scope.setCurrentPage = function(page) {
        $scope.currentPage = page;
    }
    
    $scope.showLoader = function() {
		$scope.loader = true;
    };

    $scope.hideLoader = function() {
		$scope.loader = false;
    };

    $scope.signOut = function() {
        $scope.loggingOut = true;
		$auth.signOut()
        .then(function(resp) { 
          // handle success response
            $scope.loggingOut = false;
        })
        .catch(function(resp) { 
          // handle error response
            $scope.loggingOut = false;
        });
    };

	$scope.menu = [];
    $scope.init = function() {
		$scope.menu = [
			{
			  'title': 'Dashboard',
			  'icon': 'fa-desktop',
			  'type': 'dashboard',
			  'sref': 'app.dashboard.edit'
			}, {
			  'title': 'Properties',
			  'icon': 'fa-building',
			  'type': 'properties',
			  'sref': 'app.properties.edit'
			}, {
			  'type': 'divider'
			}, {
			  'title': 'Members',
			  'icon': 'fa-users',
			  'type': 'members',
			  'sref': 'app.members.edit'
			}, {
			  'title': 'Pages',
			  'icon': 'fa-file-text-o',
			  'type': 'Pages',
			  'sref': 'app.pages.edit'
			}, {
			  'title': 'Navigation',
			  'icon': 'fa-sitemap',
			  'type': 'navigation',
			  'sref': 'app.navigation.edit'
			}, {
			  'title': 'Languages',
			  'icon': 'fa-language',
			  'type': 'language',
			  'sref': 'app.language.edit'
			}, {
			  'type': 'divider'
			}, {
			  'title': 'Transactions',
			  'icon': 'fa-comments-o',
			  'type': 'transactions',
			  'sref': 'app.transactions.edit'
			}, {
			  'title': 'Settings',
			  'icon': 'fa-cogs',
			  'type': 'settings',
			  'sref': 'app.settings.edit'
			}
		];

		//$scope.user.permissions
        $scope.refreshSettings();
        $scope.refreshLocales();

        
    };
    
    $scope.refreshSettings = function() {
        SettingsService.getArray().then(function(settings) {
            $scope.settings = settings;
            $scope.currentLocale = settings.default_locale;
        });
    };
    
    $scope.refreshLocales = function() {
        LanguageService.getList().then(function(data) {
            $scope.localesList = data;
        });
    };
    
	$scope.init();

    /*$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        console.log('$stateChangeStart --- ', event, $('#main-loader'));
	    var section = S(toState.name).between('app.', '.').s;
	    if(!_.contains($scope.user.permissions, section)) {
	    	//event.preventDefault();
	    	console.log(section + " : NOT ALLOWED");
	    }


	  });*/


    $rootScope.$on('$stateChangeSuccess', 
               function(event, toState, toParams, fromState, fromParams){
        $scope.setCurrentPage(toState.name.split('.')[1]);
        
    });
    
  });
