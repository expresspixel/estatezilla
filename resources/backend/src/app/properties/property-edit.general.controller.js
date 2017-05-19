'use strict';

angular.module('ngAdmin')
  .controller('PropertyEditGeneralCtrl', function ($scope, $stateParams, PropertyService, MemberService) {

    $scope.saving  = false;
    $scope.submitForm = function(isValid) {
        console.log('PropertyEditGeneralCtrl');
        console.log($scope.property);
        //return;
        
        var data = {};
        data['available_from'] = $scope.property.available_from;
        data['expires_at'] = $scope.property.expires_at;
        data['listing_type'] = $scope.property.listing_type;
        data['listing_status'] = $scope.property.listing_status;
        data['property_type_id'] = $scope.property.property_type_id;
        data['property_condition'] = $scope.property.property_condition;
        data['property_size'] = $scope.property.property_size;
        data['num_bedrooms'] = $scope.property.num_bedrooms;
        data['num_bathrooms'] = $scope.property.num_bathrooms;
        data['has_garden'] = $scope.property.has_garden;
        data['has_parking'] = $scope.property.has_parking;
        data['is_investment_property'] = $scope.property.is_investment_property;
        data['is_featured'] = $scope.property.is_featured;
        
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
    
    
	$scope.setToday = function() {
        if($scope.property.expires_at == '0000-00-00') {
            $scope.property.expires_at = moment().format('YYYY-MM-DD');
        }        
		if($scope.property.available_from == '0000-00-00') {
            $scope.property.available_from = moment().format('YYYY-MM-DD');
        }
    };
	
	$scope.selectedUser = {};
    $scope.pageList = [];
	$scope.changeUser = false;
    $scope.updateUserLink = function() {
        console.log('$scope.selectedUser', $scope.selectedUser);
		$scope.property.user_id = $scope.selectedUser.selected.id;
		$scope.property.email = $scope.selectedUser.selected.email;
		$scope.changeUser = false;
    };
    $scope.spinnerPage = false;
    $scope.searchUsers = function($select) {
        if($select.search.length < 1)
            return false;
        $scope.spinnerPage = true;
        return MemberService.getList( {search: $select.search, sortField: 'email', sortDirection: 'ASC' }).then(function(users) {
            $scope.userList = users;
            $scope.spinnerPage = false;
        }, function() {
            $scope.spinnerPage = false;
        });
        
    };
	
    
	$scope.init = function() {
        console.log("GENERAL CONTRLLER", $stateParams, $scope.propertyId);
		if(!_.isNull($scope.property)) {
			$scope.selectedUser.selected = {};
			$scope.selectedUser.selected.id = $scope.property.user_id;
			$scope.selectedUser.selected.email = $scope.property.email;
		}
    };
	
	$scope.$watch('propertyId', function() {
		$scope.init();
	});

});
