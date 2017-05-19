'use strict';

angular.module('ngAdmin')
  .controller('SettingsPropertiesCtrl', function ($scope, PropertyTypeService, SearchCriteriaTypeService, $q, Restangular) {
	
    $scope.searchCriteriaTypes = [];
    $scope.propertyTypes = [];
    
    $scope.newSearchCriteriaType = {};
    $scope.newPropertyType = {};
    $scope.savingAddSearchCriteriaType  = false;
    $scope.savingPropertyType  = false;
    
    $scope.editSearchCriteriaTypeKey = -1;
    $scope.moveSearchCriteriaType = function(rowKey, direction) {
        var list = $scope.searchCriteriaTypes;
        var tmpList = angular.copy(list);
        tmpList = _.sortBy(tmpList, 'position');
        
        if(direction == 'up') {
            tmpList.moveUp(tmpList[rowKey]);
        } else {
            tmpList.moveDown(tmpList[rowKey]);
        }
        _.each(tmpSearchCriteriaTypesList, function(value, index) {
            _.findWhere(list, {'id' : value.id}).position = index;
        });
        
        //now save it
        list.customPOST({'list': JSON.stringify(list)}, 'save-order').then(function(response) {
            var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
        }, function(response) {
            console.log('There was an error saving', response);
        });
        
    }
    
    $scope.editSearchCriteriaType = function(searchCriteriaTypeId) {
        $scope.editSearchCriteriaTypeKey = searchCriteriaTypeId;
        $scope.searchCriteriaTypeCopy = Restangular.copy( _.findWhere($scope.searchCriteriaTypes, {'id' : searchCriteriaTypeId}) );
    }
    
    $scope.cancelEditSearchCriteriaType = function(searchCriteriaTypeId) {
        $scope.editSearchCriteriaTypeKey = -1;
    }
    
    $scope.searchCriteriaTypeUpdating = false;
	$scope.updateSearchCriteriaType = function(searchCriteriaTypeValue, searchCriteriaTypeCopy) {
        $scope.searchCriteriaTypeUpdating = true;
        searchCriteriaTypeValue.name = angular.copy(searchCriteriaTypeCopy.name);
        searchCriteriaTypeValue.search_criteria_type_id = angular.copy(searchCriteriaTypeCopy.search_criteria_type_id);
        
        //send to server
        searchCriteriaTypeValue.save().then(function(response) {
            var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
            $scope.searchCriteriaTypeUpdating = false;
            $scope.editsearchCriteriaTypeKey = -1;
            $scope.cancelEditSearchCriteriaType(searchCriteriaTypeValue.id)
        }, function(response) {
            console.log("There was an error saving", response);
            $scope.searchCriteriaTypeUpdating = false;
        });
        
    };
    
	$scope.getSearchCriteriaTypes = function() {
        var d = $q.defer();
        SearchCriteriaTypeService.getList().then(function(response) {
             d.resolve(response);
        }, function(response) {
            d.reject(response);
        });        
        return d.promise;
    }
            
	$scope.addSearchCriteriaType = function() {
        
        var n = noty({text: 'Saving...', type:'warning', timeout: 20000});
        $scope.savingAddSearchCriteriaType  = true;
        SearchCriteriaTypeService.post($scope.newSearchCriteriaType).then(function(response) {
            
            $scope.getSearchCriteriaTypes().then(function(response) {
                var n = noty({text: 'Successfully updated!', type:'warning', timeout: 2000});    
                $scope.newSearchCriteriaType.name = null;
                $scope.searchCriteriaTypes = response;
                $scope.savingAddSearchCriteriaType  = false;
            }, function(response) {
                $scope.savingAddSearchCriteriaType  = false;
            });
            
        }, function(response) {
            var n = noty({text: 'Error saving!', type:'danger', timeout: 2000});
        });
        
    }
    
	$scope.getPropertyTypes = function() {
        var d = $q.defer();
        PropertyTypeService.getList().then(function(response) {
            d.resolve(response);
        }, function(response) {
            d.reject(response);
        });
        return d.promise;
    }
    
	$scope.addPropertyType = function() {
        
        var n = noty({text: 'Saving...', type:'warning', timeout: 20000});
        $scope.savingPropertyType  = true;
        PropertyTypeService.post($scope.newPropertyType).then(function(response) {
            
            $scope.getPropertyTypes().then(function(response) {
                var n = noty({text: 'Successfully updated!', type:'warning', timeout: 2000});    
                $scope.propertyTypes = response;
                $scope.newPropertyType.name = null;
                $scope.newPropertyType.search_criteria_type_id = _.first($scope.searchCriteriaTypes).id;
                
                $scope.savingPropertyType  = false;
            }, function(response) {
                $scope.savingPropertyType  = false;
            });
            
        }, function(response) {
            var n = noty({text: 'Error saving!', type:'danger', timeout: 2000});
            $scope.savingPropertyType  = false;
        });
        
    }

	$scope.movePropertyType = function(rowKey, direction) {
        var list = $scope.propertyTypes;
        var tmpList = angular.copy(list);
        tmpList = _.sortBy(tmpList, 'position');
        
        if(direction == 'up') {
            tmpList.moveUp(tmpList[rowKey]);
        } else {
            tmpList.moveDown(tmpList[rowKey]);
        }
        _.each(tmpPropertyTypesList, function(value, index) {
            _.findWhere(list, {'id' : value.id}).position = index;
        });
        
        //now save it
        list.customPOST({'list': JSON.stringify(list)}, 'save-order').then(function(response) {
            var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
        }, function(response) {
            console.log('There was an error saving', response);
        });
        
    }
    
    $scope.editPropertyType = function(propertyTypeId) {
        $scope.editPropertyTypeKey = propertyTypeId;
        $scope.propertyTypeCopy = Restangular.copy( _.findWhere($scope.propertyTypes, {'id' : propertyTypeId}) );
    }
    
    $scope.cancelEditPropertyType = function(propertyTypeId) {
        $scope.editPropertyTypeKey = -1;
    }
    
    $scope.propertyTypeUpdating = false;
	$scope.updatePropertyType = function(propertyTypeValue, propertyTypeCopy) {
        $scope.propertyTypeUpdating = true;
        propertyTypeValue.name = angular.copy(propertyTypeCopy.name);
        propertyTypeValue.search_criteria_type_id = angular.copy(propertyTypeCopy.search_criteria_type_id);
        
        //send to server
        propertyTypeValue.save().then(function(response) {
            var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
            $scope.propertyTypeUpdating = false;
            $scope.editPropertyTypeKey = -1;
            $scope.cancelEditPropertyType(propertyTypeValue.id)
        }, function(response) {
            console.log("There was an error saving", response);
            $scope.propertyTypeUpdating = false;
        });
        
    };
    
    
    $scope.deletePropertyType = function(propertyType) {
        //show pop-up        
        swal({
            title: 'Are you sure?',
            text: 'You will not be able to recover this property type!',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, delete it!',
            closeOnConfirm: false
        },
        function(){
            swal.close();
            $scope.showLoader();
            var n = noty({text: 'Deleting...', type: 'warning', timeout: 2000})
            propertyType.remove().then(function(response) {
                
                $scope.getPropertyTypes().then(function(response) {
                    $scope.propertyTypes = response;
                    $scope.hideLoader();
                }, function(response) {
                    $scope.hideLoader();
                });
                
                //$scope.refreshMenus();
                var n = noty({text: 'Property type deleted successfully', type:'warning', timeout: 2000});
            }, function() {
                $scope.hideLoader();
                var n = noty({text: 'There was an error deleting', type:'warning', timeout: 2000});
                console.log('There was an error saving');
            });
            
        });
        //delete

    };
    
	$scope.moveSearchCriteriaType = function(rowKey, direction) {
                
        var list = $scope.searchCriteriaTypes;
        var tmpList = angular.copy(list);
        tmpList = _.sortBy(tmpList, 'position');
        
        if(direction == 'up') {
            tmpList.moveUp(tmpList[rowKey]);
        } else {
            tmpList.moveDown(tmpList[rowKey]);
        }
        _.each(tmpList, function(value, index) {
            _.findWhere(list, {'id' : value.id}).position = index;
        });
        
        //now save it
        list.customPOST({'list': JSON.stringify(list)}, 'save-order').then(function(response) {
            var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
        }, function(response) {
            console.log('There was an error saving', response);
        });
        
    };
    
	$scope.init = function() {
        
        //$scope.loadOptions();
        $scope.showLoader();     
        console.log('getList');
        
        $q.all([
           $scope.getSearchCriteriaTypes(),
           $scope.getPropertyTypes()
        ]).then(function(data) {
           $scope.searchCriteriaTypes = data[0];
           $scope.propertyTypes = data[1];
            
			if($scope.searchCriteriaTypes.length > 0) {
				$scope.newPropertyType.search_criteria_type_id = _.first($scope.searchCriteriaTypes).id;
            }
            $scope.hideLoader();     
        });
      

    };
    
	$scope.init();

});

angular.module('ngAdmin')
.directive('editableTable', function() {
    return {
        scope: {
            list: '=list'
        },
        templateUrl: 'components/editable-table.html'
    };
});
