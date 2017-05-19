'use strict';

angular.module('ngAdmin')
  .controller('PropertyEditFeaturesCtrl', function ($scope, $stateParams, PropertyService) {
    window.scopeForm = $scope;
    
    $scope.submitForm = function(isValid) {
        $scope.saving = true;
        console.log('PropertyEditFeaturesCtrl');
        console.log($scope.form);
        //return;
        var data = {};
        data['features'] = JSON.stringify(_.pluck($scope.features, 'value'));
        console.log(data, _.pluck($scope.features, 'value'));
        $scope.translation.features = _.pluck($scope.features, 'value');
        
        if(isValid) {
            //$scope.property.translationsJson = JSON.stringify($scope.translations);
            $scope.property
                .one('locale', $scope.currentLocale)
            .customPOST(data).then(function(response) {
                var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
                $scope.saving  = false;
                
                                
               
                
              }, function(response) {
                $scope.saving = false;
                var errors = response.data.errors;
                console.log(errors);
                
                angular.forEach(response.data.errors, function(errors, field) {
                    console.log('field', field, angular.isUndefined($scope.form[field]));
                    if(!angular.isUndefined($scope.form[field])) {
                        $scope.form[field].$setValidity('server', false);
                        return $scope.errors[field] = errors.join(', ');
                    }
                });
                var n = noty({text: 'There was an error saving', type:'warning', timeout: 2000});
                console.log("There was an error saving", response);
              });
        }
 	  
        return false;
    };
    
	$scope.init = function() {
        console.log('translation', $scope.translation);
        if($scope.translation.features != null) {
            //var feature_list = JSON.parse($scope.translation.features);
            var feature_list = $scope.translation.features;
        } else {
            var feature_list = {};
        }
        $scope.features = [];
        for (var i = 0; i < 10; i++) {
            var value = "";
            if($scope.translation.features != null && !_.isUndefined(feature_list[i])) {
                value = feature_list[i];
            }
            $scope.features.push({'id' : i, 'value' : value});
        }
        console.log("PropertyEditFeaturesCtrl CONTRLLER", $stateParams);
    };
	
 $scope.$watch('propertyId', function() {
       $scope.init();
   });	
 $scope.$watch('currentLocale', function() {
       $scope.init();
   });
});
