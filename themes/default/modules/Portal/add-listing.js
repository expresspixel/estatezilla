var myApp = angular.module('myApp',[]);

myApp.controller('AddListingController', function($scope) {

	$scope.showFeaturesToggle = function() {
		$scope.showFeatures = true;
	};
	$scope.hideFeaturesToggle = function() {
		$scope.showFeatures = false;
	};
	$scope.showFeatures = false;
	
	
});