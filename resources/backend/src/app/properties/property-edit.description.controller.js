'use strict';

angular.module('ngAdmin')
  .controller('PropertyEditDescriptionCtrl', function ($scope, $stateParams, PropertyService) {

    $scope.saving  = false;
    $scope.submitForm = function(isValid) {
        console.log('PropertyEditDescriptionCtrl');
        console.log($scope.property);
        //return;
        
        var data = {};
        data['title'] = $scope.translation.title;
        data['summary'] = $scope.translation.summary;
        data['description'] = $scope.translation.description;
        data['visibility'] = $scope.translation.visibility;
        
        if(isValid) {
            //$scope.property.translationsJson = JSON.stringify($scope.translations);
            $scope.saving  = true;
            $scope.property
                .one('locale', $scope.currentLocale)
                //.one('translation', $scope.translation.id)
            .customPOST(data).then(function(response) {
                 $scope.saving  = false;
                var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
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
    
	$scope.init = function() {
        console.log("***DESCRIPTION CONTRLLER***", $stateParams);
    };
	
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        console.log("$stateChangeSuccess");
    });
    
    $scope.$watch('propertyId', function() {
       console.log('hey, propertyId has changed!', $scope.propertyId);
    });
    
	$scope.init();

});
