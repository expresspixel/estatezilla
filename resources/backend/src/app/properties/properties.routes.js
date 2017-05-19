'use strict';

angular.module('ngAdmin')
    .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('app.properties', {
            url: '/properties',
            abstract: true,
            //templateUrl: 'app/viewer.html'
            //templateUrl: 'app/viewer.html',
            views: {
                "" : {
                    //templateUrl: 'app/viewer.html'
                    templateUrl: 'app/properties/properties.html',
                    controller: 'PropertiesCtrl',
                },
                'list@app.properties': {
                    templateUrl: 'app/properties/property-list.html',
                    controller: 'PropertyListCtrl'
                },
                'editor@app.properties': {
                    templateUrl: 'app/properties/property-editor.html',
                    controller: 'PropertiesEditCtrl'
                }
            },
            onExit: function(){
                console.log("EXIT");
                $('#page-content-wrapper.properties').css('max-height', 'none');
            }

        })  
        .state('app.properties.index', {
            url: '/index'
            //controller: 'PropertyIndexCtrl'
        })
        .state('app.properties.edit', {
            url: '/edit/:propertyId/:locale',
            params: {
                propertyId: {value: null},
                locale: {value: null}
            },
            //controller: 'PropertiesEditCtrl'
           /* views: {
                'list@app.properties': {
                    templateUrl: 'app/properties/property-list.html',
                    controller: 'PropertyListCtrl'
                },
                'editor@app.properties': {
                    templateUrl: 'app/properties/property-editor.html',
                    controller: 'PropertiesEditCtrl'
                },
                'description@app.properties.edit': {
                    templateUrl: 'app/properties/forms/description.html',
                    controller: 'PropertyEditDescriptionCtrl'
                },
                'features@app.properties.edit': {
                    templateUrl: 'app/properties/forms/features.html',
                    controller: 'PropertyEditFeaturesCtrl'
                },
                'general@app.properties.edit': {
                    templateUrl: 'app/properties/forms/general.html',
                    controller: 'PropertyEditGeneralCtrl'
                },
                'images@app.properties.edit': {
                    templateUrl: 'app/properties/forms/images.html',
                    controller: 'PropertyEditImagesCtrl'
                },
                'address@app.properties.edit': {
                    templateUrl: 'app/properties/forms/address.html',
                    controller: 'PropertyEditAddressCtrl'
                }
            }*/
        })
    ;

});
