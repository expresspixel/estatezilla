'use strict';

angular.module('ngAdmin')
  .controller('PropertyEditPricingCtrl', function ($scope, $stateParams, PropertyService) {

    $scope.saving  = false;
    $scope.submitForm = function(isValid) {
        console.log('PropertyEditPricingCtrl');
        console.log($scope.property);
        //return;
        
        var data = {};
        data['price'] = $scope.property.price;
        data['reduced_price'] = $scope.property.reduced_price;
        data['negotiable_price'] = $scope.property.negotiable_price;
        data['poa'] = $scope.property.poa;
        data['price_period'] = $scope.property.price_period;
        data['price_type'] = $scope.property.price_type;
        
        if(isValid) {
            $scope.saving  = true;
            //$scope.property.translationsJson = JSON.stringify($scope.translations);
            $scope.property
                .customPOST(data).then(function(response) {
                var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
                $scope.saving  = false;
              }, function(response) {
                $scope.saving  = false;
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
    
    /*
	$scope.init = function() {
        console.log("GENERAL CONTRLLER", $stateParams);
    };
	
	$scope.init();*/

});
