'use strict';

angular.module('ngAdmin')
  .controller('SettingsLanguagesCtrl', function ($scope, LanguageService, Restangular, $q, SettingsService) {
	
    window.LanguageService = LanguageService;
    window.scope = $scope;
    $scope.additional = {};
    $scope.languageOptions = [];
    
    $scope.additionalSelect = function($item, $model, $label) {
        //console.log('additionalSelect: ' , $item, $model, $label);
        $scope.additional.code = $item.code;
    };
    
    $scope.loadOptions = function() {
        console.log('Page changed to: ' + $scope.currentPage);

        // This will query /members and return a promise.
        $scope.showLoader();
        LanguageService.one().getList('options').then(function(options) {
            $scope.languageOptions = options;            
            $scope.hideLoader();
        });

    };

    
	$scope.move = function(localeKey, direction) {
        var locale = $scope.localesList[$scope.localeKey];
        var tmpLocalesList = angular.copy($scope.localesList);
        tmpLocalesList = _.sortBy(tmpLocalesList, "position");
        
        if(direction == 'up') {
            tmpLocalesList.moveUp(tmpLocalesList[localeKey]);
        } else {
            tmpLocalesList.moveDown(tmpLocalesList[localeKey]);
        }
        _.each(tmpLocalesList, function(value, index) {
            _.findWhere($scope.localesList, {'id' : value.id}).position = index;
        });
        
        //now save it
        $scope.localesList.customPOST({'locales': JSON.stringify($scope.localesList)}, "save-order").then(function(response) {
            //var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
        }, function(response) {
            console.log("There was an error saving", response);
        });
    };
    
    $scope.localeUpdating = false;
	$scope.setVisible = function(localeValue, value) {
        $scope.localeUpdating = true;
        localeValue.visible = value;
        //send to server
        localeValue.save().then(function(response) {
            var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
            $scope.localeUpdating = false;
        }, function(response) {
            console.log("There was an error saving", response);
            $scope.localeUpdating = false;
        });
        
    };	
	$scope.updateLocale = function(localeValue, localeCopy) {
        $scope.localeUpdating = true;
        localeValue.name = angular.copy(localeCopy.name);
        localeValue.code = angular.copy(localeCopy.code);
        
        //send to server
        localeValue.save().then(function(response) {
            var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
            $scope.localeUpdating = false;
            $scope.editKey = -1;
        }, function(response) {
            console.log("There was an error saving", response);
            $scope.localeUpdating = false;
        });
        
    };
    $scope.editKey = -1;
    $scope.edit = function(localeId) {
        console.log('localeKey', localeId);
        $scope.editKey = localeId;
        $scope.localeCopy = Restangular.copy( _.findWhere($scope.localesList, {'id' : localeId}) );
    }
    $scope.cancelEdit = function(localeId) {
        console.log('localeKey', localeId);
        $scope.editKey = -1;
    }
         
    $scope.deleteLocale = function(locale) {
        //show pop-up        
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this language!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, delete it!',
            closeOnConfirm: false,
            //closeOnCancel: false
        },
        function(){
            swal.close();
            $scope.showLoader();
            var n = noty({text: 'Deleting...', type:'warning', timeout: 2000})
            locale.remove().then(function(response) {
                $scope.hideLoader();
                $scope.localesList = _.without($scope.localesList, locale);
                
                //$scope.refreshMenus();
                var n = noty({text: 'Language deleted successfully', type:'warning', timeout: 2000});
            }, function() {
                $scope.hideLoader();
                var n = noty({text: "There was an error deleting", type:'warning', timeout: 2000});
                console.log("There was an error saving");
            });
            
        });
        //delete

    };
	
	$scope.setDefaultLocaleLink = function(localeCode) {
        $scope.currentLocale = localeCode;
        $scope.setDefaultLocaleForm();
    };
    
	$scope.setDefaultLocaleForm = function() {
        var n = noty({text: 'Saving...', type:'warning', timeout: 20000});
        SettingsService.save({'default_locale':$scope.currentLocale}).then(function(response) {
            var n = noty({text: 'Saved!', type:'warning', timeout: 2000});
        }, function(response) {
            var n = noty({text: 'Error saving!', type:'danger', timeout: 2000});
        });
    };
    
	$scope.addLocale = function() {
        //send request to server
        $scope.additional.position = _.size($scope.localesList) + 1;
        var n = noty({text: 'Saving...', type:'warning', timeout: 20000})
        LanguageService.post($scope.additional).then(function(response) {
                console.log("Object saved OK", response);
                if(response.status == 'success') {
                    $scope.getLocales().then(function() {
                        var n = noty({text: 'Success - A new language was added', type:'warning', timeout: 2000});
                    });
                }
                $scope.additional = {};
          }, function(response) {
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
    };    
            
    $scope.getLocales = function() {
        var deferred = $q.defer();
        LanguageService.getList().then(function(data) {
            $scope.localesList = data;
            deferred.resolve(data);
        });        
        return deferred.promise;
    };
    
	$scope.init = function() {
        $scope.loadOptions();
        $scope.showLoader();
        /*$scope.getLocales().then(function() {
            $scope.hideLoader();
        });*/
        //$scope.currentLocale =  $scope.currentLocale;
        /*console.log('getList');
        SettingsService.getList().then(function(response) {
            
            if(SettingsService.get('default_locale')) {
                $scope.currentLocale = SettingsService.get('default_locale');
            }
            
        }, function(response) {
            
        });  */      
        
    };
    
	$scope.init();

});

Array.prototype.moveUp = function(value, by) {
    var index = this.indexOf(value),     
        newPos = index - (by || 1);
     
    if(index === -1) 
        throw new Error('Element not found in array');
     
    if(newPos < 0) 
        newPos = 0;
         
    this.splice(index,1);
    this.splice(newPos,0,value);
};
 
Array.prototype.moveDown = function(value, by) {
    var index = this.indexOf(value),     
        newPos = index + (by || 1);
     
    if(index === -1) 
        throw new Error('Element not found in array');
     
    if(newPos >= this.length) 
        newPos = this.length;
     
    this.splice(index, 1);
    this.splice(newPos,0,value);
};