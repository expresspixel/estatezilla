'use strict';

angular.module('ngAdmin')
  .controller('PropertyEditAddressCtrl', function ($scope, $stateParams, PropertyService) {
    
    window.scopeAddress = $scope;
    
    $scope.submitForm = function(isValid) {
        console.log('PropertyEditGeneralCtrl');
        console.log($scope.property);
        //return;
        
        var data = {};
        data['displayable_address'] = $scope.property.displayable_address;
        data['street_no'] = $scope.property.street_no;
        data['street_name'] = $scope.property.street_name;
        data['city'] = $scope.property.city;
        data['region'] = $scope.property.region;
        data['country'] = $scope.property.country;
        data['postcode'] = $scope.property.postcode;
        data['lat'] = $scope.property.lat;
        data['lng'] = $scope.property.lng;
        
        if(isValid) {
            //$scope.property.translationsJson = JSON.stringify($scope.translations);
            $scope.property
                .customPOST(data).then(function(response) {
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
    
    
	$scope.setToday = function() {
        if($scope.property.expires_at == '0000-00-00') {
            $scope.property.expires_at = moment().format('YYYY-MM-DD');
        }
    };
    
	$scope.init = function() {
        console.log("GENERAL CONTRLLER", $stateParams);
        
/*
        addresspicker = $( "#addresspicker" ).addresspicker();
        addresspickerMap = $( "#addresspicker_map" ).addresspicker({
                regionBias: "be",
                draggableMarker: !$("#addresspicker_map").is(":disabled"),
                updateCallback: showCallback,
                elements: {
                map: "#map",
                lat: "#lat",
                lng: "#lng",
                street_number: '#street_no',
                route: '#street_name',
                locality: '#city',
                administrative_area_level_2: '#administrative_area_level_2',
                administrative_area_level_1: '#administrative_area_level_1',
                country: '#country',
                country_code: '#country_code',
                postal_code: '#postcode',
                type: '#type'
            }
        });
        if($( "#addresspicker" ).length > 0) {
            gmarker = addresspickerMap.addresspicker( "marker");
            gmarker.setVisible(true);
        }
        addresspickerMap.addresspicker( "updatePosition");

        $("#addresspicker_map").addresspicker("option", "reverseGeocode", true);

        function showCallback(geocodeResult, parsedGeocodeResult){
            $('#callback_result').text(JSON.stringify(parsedGeocodeResult, null, 4));
        }
      */  
    };
    	
    $scope.showCallback = function(geocodeResult, parsedGeocodeResult) {
        
        var components = [
            'street_no', 'street_name', 'city', 'region', 'country',
            'postcode', 'lat', 'lng',
        ];
        _.each(components, function(component) { 
            $scope.property[component] =  geocodeResult[component];
        });
        $scope.property.displayable_address = geocodeResult.value;
        $scope.property.street_no = parsedGeocodeResult.street_number;
        $scope.property.street_name = parsedGeocodeResult.route;
        $scope.property.city = parsedGeocodeResult.locality;
        $scope.property.region = parsedGeocodeResult.administrative_area_level_2;
        $scope.property.country = parsedGeocodeResult.country_code;
        $scope.property.postcode = parsedGeocodeResult.postal_code;
        $scope.property.lat = parsedGeocodeResult.lat;
        $scope.property.lng = parsedGeocodeResult.lng;
        $scope.$apply();
        console.log(geocodeResult, JSON.stringify(parsedGeocodeResult, null, 4));
        //$('#callback_result').text(JSON.stringify(parsedGeocodeResult, null, 4));
    };
    $scope.addresspickerMap = false;
    $scope.setView = function() {
        /*
            console.log($scope.property);
            var lat = $scope.property.lat;
            var lng = $scope.property.lng;
        */
        $scope.addresspickerMap = $( "#addresspicker_map" ).addresspicker({
                regionBias: "gb",
                draggableMarker: !$("#addresspicker_map").is(":disabled"),
                updateCallback: $scope.showCallback,
                reverseGeocode: true,
                mapOptions: {
                  //center: new google.maps.LatLng($scope.property.lat, $scope.property.lng)
                },
                elements: {
                    map: "#map",
                    lat: "#lat",
                    lng: "#lng",
                    street_number: '#street_no',
                    route: '#street_name',
                    locality: '#city',
                    administrative_area_level_2: '#region',
                    country: '#country',
                    country_code: '#country',
                    postal_code: '#postcode',
                    type: '#type'
                }
        });
        
        $scope.addresspickerMap.addresspicker( "updatePosition");
        
        $( "#addresspicker_map" ).addresspicker( "resize");
        setInterval(function(){
            //$( "#addresspicker_map" ).addresspicker( "resize");
        }, 1000);
    };
    
 $scope.$watch('property.lat', function(newValue, oldValue) {
     
     console.log('property.lat', _.isNull(newValue), newValue, oldValue);
     
     if(_.isNull(newValue))
         return;
     
     console.log('property.lat', newValue, oldValue, $scope.property, $scope.addresspickerMap);
     
     if($scope.addresspickerMap) {
        
         setTimeout(function(){
             $( "#addresspicker_map" ).addresspicker( "resize");
            $scope.addresspickerMap.addresspicker( "reloadPosition");
        }, 1000);
         
        console.log('property.lat', $scope.property, $scope.addresspickerMap);
         
     }
     
   });
    
    $scope.$watch('$viewContentLoaded', function(){
        setTimeout(function(){
            $scope.setView();
        }, 1000);
    });
	
	$scope.init();

});
