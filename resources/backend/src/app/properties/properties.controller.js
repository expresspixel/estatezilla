'use strict';

angular.module('ngAdmin')
    .controller('PropertiesCtrl', function ($scope, PropertyService, PropertyTypeService, SettingsService, LanguageService, $modal, $q, $state) {
    
    window.scope = $scope;
    $scope.propertyLoader = false;
    $scope.propertyTypes = {};
    $scope.isMobile = false;
    $scope.propertyId = 0;
    $scope.propertiesList = [];

    $scope.resize = function() {
        
        console.log('$(window).width()', $(window).width());
        if($(window).width() <= 768) {
            //$scope.displayEditor = false;
            $scope.isMobile = true;
            _.defer(function(){$scope.$apply();});
        } else {
            $scope.isMobile = false;
            $scope.displayEditor = true;
            _.defer(function(){$scope.$apply();});
        }
        
        
        if($(window).width() > 768) {
            $('.sticky-bar').css("position", 'relative');
            $('.sticky-bar').css("width", 'auto');
            $('.sticky-bar').css("height", 'auto');
            $('.listings-scrollpane').css("width", 'auto');
            $('.listings-wrapper').css("min-height", $('#page-content-wrapper').height() - 168);
            $('#page-content-wrapper.properties').css('max-height', $(window).height() - 110);
            

            setTimeout(function(){
                $('#page-content-wrapper.properties').css('max-height', $(window).height() - 178);
                if($(window).width() > 768 && $(window).width() <= 1200) {
                    $('#page-content-wrapper.properties').css('max-height', $(window).height()-28);
                }
                $('.listings-wrapper').css("min-height", parseInt($('#page-content-wrapper').css('max-height')) - 10);

                $('.listings-bar').css("height", $('.listings-wrapper').height()+20);          
                $('#scroller').css("height", $('#page-content-wrapper').height() - 152);          
                $('.listings-scrollpane').css("height", $('#page-content-wrapper').height() - 152);   
                $('.listings-scrollpane').css("width", $('.listings-bar').width());   
                
                $('.sticky-bar').css("height", $('.listings-wrapper').height());          
                $('.sticky-bar').css("width", $('.listings-bar').width()); 
            }, 500);
        }
        
        
        setTimeout(function(){
            if($(window).width() > 768 && $(window).width() <= 1200) {
                $('.sticky-bar').css("position", 'fixed'); 
            } else {
                $('.sticky-bar').css("position", 'relative');                
            }
        }, 500);
        
        return false;


        var container = document.getElementById('scroller');
        if($('#scroller .ps-scrollbar-y-rail').length == 0) {
            /*Ps.initialize(container, {
                wheelSpeed: 1,
                wheelPropagation: true,
                suppressScrollX: true,
                maxScrollbarLength: 50
            });*/
        } else {
            //Ps.update(container);
        }

        setTimeout(function(){
            if($(window).width() < 970) {
                /*Ps.destroy(container);*/
                $('.sticky-bar').css("position", 'relative');
                $('.sticky-bar').css("width", 'auto');
                $('.sticky-bar').css("height", 'auto');
                $('.listings-scrollpane').css("width", 'auto');
                $('.sticky-bar').css("position", 'relative');
                $('#scroller').css("position", 'relative');
            }
        }, 600);
        
       

        

    };
    
    
	$scope.displayEditor = true;
	$scope.init = function() {
        /*
        SettingsService.getArray().then(function(settings) {
            $scope.settings = settings;
        }); 
        */
        PropertyTypeService.getList().then(function(response) {
            $scope.propertyTypes = response;
        }, function(response) {
            
        });
        /*
        
        $scope.localesList = [];

        LanguageService.getList().then(function(data) {
            $scope.localesList = data;
            console.log($scope.localesList);
        });
        */
        
        $(window).resize(function(){
            $scope.resize();            
        });
        
    };
    $scope.init();
    
	$scope.setPropertyId = function(propertyId) {
        $scope.propertyId = propertyId;
    };
	$scope.showEditor = function() {
        $scope.displayEditor = true;
    };
        
	$scope.hideEditor = function() {
        $scope.displayEditor = false;
    };    
	$scope.showPropertyLoader = function() {
        $scope.propertyLoader = true;
    };
        
	$scope.hidePropertyLoader = function() {
        $scope.propertyLoader = false;
    };        
            
	$scope.getPropertyLoader = function() {
        return $scope.propertyLoader;;
    };        
    
    
	$scope.listLoader = false;
    $scope.showListLoader = function() {
        $scope.listLoader = true;
    };
        
	$scope.hideListLoader = function() {
        $scope.listLoader = false;
    };
    	
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        console.log("PRO $stateChangeSuccess");
    });


});


function debouncer( func , timeout ) {
    var timeoutID , timeout = timeout || 200;
    return function () {
        var scope = this , args = arguments;
        clearTimeout( timeoutID );
        timeoutID = setTimeout( function () {
            func.apply( scope , Array.prototype.slice.call( args ) );
        } , timeout );
    }
}
