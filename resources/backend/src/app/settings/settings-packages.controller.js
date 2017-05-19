'use strict';

angular.module('ngAdmin')
  .controller('SettingsPackagesCtrl', function ($scope, PropertyTypeService, SearchCriteriaTypeService, $q, Restangular, SettingsService, PackageService) {
	
    $scope.packageList = [];
    $scope.newPackage = {};
    
	$scope.getPackages = function() {
        var d = $q.defer();
        PackageService.getList().then(function(response) {
            d.resolve(response);
        }, function(response) {
            d.reject(response);
        });
        return d.promise;
    }
    
	$scope.addPackage = function() {
        
        var n = noty({text: 'Saving...', type:'warning', timeout: 20000});
        $scope.savingPackage  = true;
        PackageService.post($scope.newPackage).then(function(response) {
            
            $scope.getPackages().then(function(response) {
                var n = noty({text: 'Successfully updated!', type:'warning', timeout: 2000});    
                $scope.newPackage.credits = null;
                $scope.newPackage.price = null;
                
                $scope.savingPackage  = false;
            }, function(response) {
                $scope.savingPackage  = false;
            });
            
        }, function(response) {
            var n = noty({text: 'Error saving!', type:'danger', timeout: 2000});
            $scope.savingPackage  = false;
        });
        
    }

    $scope.editPackage = function(packageId) {
        $scope.editPackageKey = packageId;
        $scope.packageCopy = Restangular.copy( _.findWhere($scope.packageList, {'id' : packageId}) );
    }
    
    $scope.cancelEditPackage = function(packageId) {
        $scope.editPackageKey = -1;
    }
    
    $scope.packageUpdating = false;

	$scope.updatePackage = function(packageValue, packageCopy) {
        $scope.packageUpdating = true;
        packageValue.credits = angular.copy(packageCopy.credits);
        packageValue.price = angular.copy(packageCopy.price);
        
        //send to server
        packageValue.save().then(function(response) {
            var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
            $scope.packageUpdating = false;
            $scope.editPackageKey = -1;
            $scope.cancelEditPackage(packageValue.id)
        }, function(response) {
            console.log("There was an error saving", response);
            $scope.packageUpdating = false;
        });
        
    };
    
    
	$scope.getPackages = function() {
        var d = $q.defer();
        PackageService.getList().then(function(response) {
            $scope.packageList = _.filter(response, function(item) {
                return item.monthly !== 1;
            });
            $scope.monthlyPackage = _.findWhere(response, {'monthly' : 1});
            
            d.resolve(response);
        }, function(response) {
            d.reject(response);
        });
        return d.promise;
    }
    
    $scope.deletePackage = function(packageId) {
        //show pop-up        
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this property type!",
            type: "warning",
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
                
                $scope.getPackages().then(function(response) {
                    $scope.hideLoader();
                }, function(response) {
                    $scope.hideLoader();
                });
                
                //$scope.refreshMenus();
                var n = noty({text: 'Property type deleted successfully', type:'warning', timeout: 2000});
            }, function() {
                $scope.hideLoader();
                var n = noty({text: "There was an error deleting", type:'warning', timeout: 2000});
                console.log("There was an error saving");
            });
            
        });
        //delete

    };
    
    $scope.savingMonthlyPackage = false;
    $scope.monthlyPackage = {};
    
    $scope.saveMonthlyPackage = function() {
        $scope.savingMonthlyPackage = true;
        //send to server
        $scope.monthlyPackage.save().then(function(response) {
            var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
            $scope.savingMonthlyPackage = false;
        }, function(response) {
            console.log("There was an error saving", response);
            $scope.savingMonthlyPackage = false;
        }); 
    }
    
        
	$scope.init = function() {
        
        //$scope.loadOptions();
        $scope.showLoader();     
        console.log('getList');
        SettingsService.getArray().then(function(response) {
            $scope.settings = response;
        }, function(response) {
            
        });
         
        $q.all([
           SettingsService.getArray(),
           $scope.getPackages()
        ]).then(function(response) {
            $scope.settings = response[0];
            //$scope.packageList = data[1];
            
            $scope.packageList = _.filter(response[1], function(item) {
                return item.monthly !== 1;
            });
            $scope.monthlyPackage = _.findWhere(response[1], {'monthly' : 1});
            
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
