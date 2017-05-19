'use strict';

angular.module('ngAdmin')
  .controller('NavigationCreateCtrl', function ($scope, MenuService) {
    
	window.scope = $scope;
    $scope.errors = {};
    $scope.menu = {};
    $scope.loading = false;
	
    $scope.init = function() {
		
    };
    
    $scope.dismiss = function() {
        $scope.$dismiss();
    };
        
    $scope.slugify = function(input) {
        $scope.menu.handle = S(input).slugify().s;
    };

    
    $scope.submitForm = function(isValid) {
        if(isValid) {
            $scope.loading = true;
            MenuService.post($scope.menu).then(function(response) {
                $scope.loading = false;
                console.log("Object saved OK", response);
                var n = noty({text: 'Success - A new menu was added', type:'warning', timeout: 2000});
                $scope.$close(response);
              }, function(response) {
                $scope.loading = false;
                var errors = response.data.errors;
                console.log(errors);
                
                angular.forEach(response.data.errors, function(errors, field) {
                    console.log('field', field, angular.isUndefined($scope.form[field]));
                    if(!angular.isUndefined($scope.form[field])) {
                        $scope.form[field].$setValidity('server', false);
                        
                        return $scope.errors[field] = errors.join(', ');
                    }
                });
                
                console.log("There was an error saving", response);
              });
        }
 	  
        return false;

    };
    
	$scope.init();

});
