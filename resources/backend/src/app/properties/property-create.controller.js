'use strict';

angular.module('ngAdmin')
  .controller('PropertyCreateCtrl', function ($scope, PropertyService, propertyTypes, $state) {
    
    $scope.propertyTypes = propertyTypes;
    window.scopeModal = $scope;
    $scope.errors = {};
    $scope.property = {};
    $scope.loading = false;	
    
    $scope.dismiss = function() {
        $scope.$dismiss();
    };
    
    $scope.submitForm = function(isValid) {
        if(isValid) {
            $scope.loading = true;
            PropertyService.post($scope.property).then(function(response) {
                $scope.loading = false;
                console.log("Object saved OK", response);
                noty({text: 'Listing added! - complete the property details to publish', type:'warning', timeout: 2000});
                $scope.$close(response);
                $state.go('app.properties.edit', {propertyId: response.property.id});
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
    
	$scope.init = function() {
        console.log($scope.propertyTypes);
    };
    
	$scope.init();

});
