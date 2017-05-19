'use strict';

angular.module('ngAdmin')
  .controller('PropertiesEditCtrl', function ($scope, $stateParams, PropertyService, PropertyTypeService, LanguageService) {
	$scope.property = null;
    window.scopeEdit = $scope;
    
    $scope.translations = {};
    $scope.translation = {};
    $scope.propertyTypes = [];
    $scope.editorOptions = {
        uiColor: '#e2e2e2'
    };
    
    $scope.saveVisibility = function(visible) {
        console.log($scope.property, visible);
        $scope.property.save().then(function(response) {
                var text = 'Set visible';
                if($scope.property.visible == 0)
                    var text = 'Set hidden';
                var n = noty({text: text, type:'warning', timeout: 2000});
            }, function(response) {
                console.log("There was an error saving", response);
            });
    };
    
	$scope.switchLocale = function(locale) {
        
        $scope.translations[$scope.currentLocale] = $scope.translation;
        $scope.currentLocale = locale;
        console.log($scope.property);
        
        $scope.translation = _.findWhere($scope.property.translations, {locale:locale});
        if( !_.isUndefined($scope.translation) ){
            $scope.translations[locale] =  $scope.translation;
        } else {
            console.log('$scope.property.translations', $scope.currentLocale, $scope.property.id, $scope.property.translations);
            $scope.property.translations.push({
                locale: locale,
                title: "title " + locale,
                description: "",
                summary: "",
                features: null,
                property_photos_meta: null,
                floor_plans_meta: null,
                documents_meta: null,
                virtual_tours: null,
                status: null,
                visibility: null
            });
           $scope.translations[locale] = _.findWhere($scope.property.translations, {locale:locale})
        }
        
        $scope.translation = $scope.translations[locale];
        
    };
    
        
    $scope.submitForm = function(isValid) {
        console.log($scope.property);
        if(isValid) {
            $scope.property.translationsJson = JSON.stringify($scope.translations);
            $scope.property.save().then(function(response) {
                var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
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
        }
 	  
        return false;
    };
    $scope.propertyTypes = {};
	$scope.getPropertyDetails = function(id) {
        console.log('getPropertyDetails', id);
        $scope.showPropertyLoader();
        PropertyService.one($scope.propertyId).get().then(function(property) {
            console.log('getPropertyDetails', property);
            $scope.property = property;
            $scope.propertyTypes = property.meta.property_types;
			if(!_.isNull(property.meta.user)) {
				$scope.property.email = property.meta.user.email;
			} else {
				$scope.property.email = '';	
			}
            console.log('property', $scope.property);
            $scope.switchLocale($scope.currentLocale);    
            $scope.hidePropertyLoader();
            $scope.resize();
            $scope.setPropertyId(property.id);
        });        
        console.log($stateParams);
        
    };	

	$scope.isEditable = false;
	$scope.init = function() {
        
        console.log("EDIT CONTRLLER", $stateParams);
        //$scope.showPropertyLoader();
		
        if(!_.isUndefined($stateParams['propertyId']) && $stateParams['propertyId'] != 0) {
			$scope.isEditable = true;
            $scope.setPropertyId($stateParams['propertyId']);
            $scope.getPropertyDetails($scope.propertyId);
        } else {
			$scope.isEditable = false;
		}

        $scope.resize();
    };
    
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        console.log("EDIT $stateChangeSuccess", fromParams['propertyId'], fromParams);
		if(!_.isUndefined(toParams['propertyId']) && toParams['propertyId'] != 0) {
			$scope.isEditable = true;
            $scope.setPropertyId(toParams['propertyId']);
            $scope.getPropertyDetails($scope.propertyId);
        } else {
			$scope.isEditable = false;
		}
        
    });

    
        /*
    $scope.$on('$viewContentLoaded', function(){
         console.log("-- EDIT CONTRLLER -- ", $stateParams);
        //alert(5);
        $scope.resize();
    });
    */
	$scope.init();

});
