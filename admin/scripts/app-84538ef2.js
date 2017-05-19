'use strict';

var stringjs = angular.module('stringjs', []);
stringjs.factory('S', function() {
    return window.S; // assumes underscore has already been loaded on the page
});

var lodash = angular.module('lodash', []);
lodash.factory('_', function() {
    return window._; // assumes underscore has already been loaded on the page
});

//fetch the API URL
var API_URL = '../';

angular.module('ngAdmin', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'restangular', 'ui.router', 'ui.bootstrap', 'stringjs', 'ng-token-auth', 'angularMoment', 'angular-data.DSCacheFactory', 'ngMessages', 'ngCkeditor', 'lodash', 'ui.ace', 'ui.tree', 'ui.select', 'ngSanitize', 'ngRange', 'ui.bootstrap.datetimepicker', 'ui.dateTimeInput', 'angularFileUpload', 'truncate', 'xeditable', 'ngAnalytics', 'ui.router.stateHelper', 'ct.ui.router.extras', 'formly', 'formlyBootstrap', 'google.places', 'oc.lazyLoad'])
    .config(function ($stateProvider, $urlRouterProvider, $authProvider, RestangularProvider, formlyConfigProvider) {
    $stateProvider

        .state('index', {
        url: '/',
        templateUrl: 'app/index.html',
        controller: function($state, $auth) {
            $auth.validateUser().then(function(user) {
                // if the user is authenticated, redirect to the dashboard
                $state.go('app.properties.index');
            }).catch(function(resp) {
                // handle error response
                $state.go('auth.login');
            });

            // otherwise proceed as normal
        }
    })
	.state('app', {
        url: '/app',
        templateUrl: 'app/main.html',
        controller: 'MainCtrl',
        abstract: true,
        resolve: {
            authorize: function($auth, $state) {
                console.log('app.validateUser', $auth);

                return $auth.validateUser().then(function(user) {
                    // if the user is authenticated, redirect to the dashboard
                    console.log(user);
                }).catch(function(resp) {
                    // handle error response
                    $state.go('auth.login');
                });

                return $auth.validateUser().catch(function(){
                    // redirect unauthorized users to the login page
                    $state.go('auth.login');
                });
            }
        }
    });

    $urlRouterProvider.otherwise('/');

    $authProvider.configure({
        apiUrl: API_URL + 'admin',

        handleLoginResponse: function(resp, $auth) {
            console.log('resp', resp);
            // the persistData method will store the token for subsequent requests.
            // this will be stored using cookies or localStorage depending on your config.
            $auth.persistData('auth_headers', {
                // save the token
                'Authorization': 'Bearer ' + resp['access_token'],
                // convert the expiry value into a date that this module understands
                'expiry': moment().add(resp['expires_in'], 'seconds').valueOf()
            });

            // the object returned by this method will be attached to the $rootScope as
            // the "user" object. The object needs a "uid" value at minimum
            return resp['data'];
        },

        // now that the token expiration date is stored, let the module know
        // where to find it
        parseExpiry: function(headers) {
            return headers['expiry'];
        },

        // this will let the module know what properties to add to subsequent requests
        // to the API
        tokenFormat: function() {
            return {
                'Authorization': 'Bearer {{ token }}'
            };
        },

        handleTokenValidationResponse: function(response) {
            return response.data;
        }

    });


    RestangularProvider.setBaseUrl(API_URL + 'admin/api');
    //RestangularProvider.setDefaultHttpFields({cache: true});
    // add a response intereceptor
    RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
        //console.log(data, operation, what, url, response, deferred);
        var extractedData;
        // .. to look for getList operations
        if (operation === "getList") {
            //cosole.log(data);
            //console.log(extractedData);
            extractedData = data;
            if("data" in data ) {
                extractedData = data.data;
                delete data.data;
                extractedData.meta = data;
            }
            //console.log(typeof extractedData, extractedData);
        } else {
            extractedData = data;
        }
        return extractedData;
    });
    RestangularProvider.setRestangularFields({
        id: 'id'
    });

    // formly
    formlyConfigProvider.setType({
      name: 'custom',
      templateUrl: 'custom.html'
    });

});
angular.module('ngAdmin').run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

angular.module('ngAdmin').config(['$httpProvider', function ($httpProvider) {

    $httpProvider.interceptors.push(['$q', function ($q) {
                var _queue = [];

                /**
                 * Executes the top function on the queue (if any).
                 */
                function _executeTop() {
                    if (_queue.length === 0) {
                        return;
                    }
                    _queue[0]();
                }

                return {
                    /**
                     * Blocks each request on the queue. If the first request, processes immediately.
                     */
                    request: function (config) {
                        if (config.url.substring(0, 4) == 'http') {
                            var deferred = $q.defer();
                            _queue.push(function () {
                                deferred.resolve(config);
                            });
                            if (_queue.length === 1) {
                                _executeTop();
                            }
                            return deferred.promise;
                        } else {
                            return config;
                        }
                    },
                    /**
                     * After each response completes, unblocks the next request.
                     */
                    response: function (response) {
                        if (response.config.url.substring(0, 4) == 'http') {
                            _queue.shift();
                            _executeTop();
                        }
                        return response;
                    },
                    /**
                     * After each response errors, unblocks the next request.
                     */
                    responseError: function (responseError) {
                        if (responseError.config.url.substring(0, 4) == 'http') {
                            _queue.shift();
                            _executeTop();
                        }
                        return $q.reject(responseError);
                    },
                };
            }]);

}]);

angular.module('ngAdmin')
    .run(function($rootScope, $state, $stateParams, S, $auth, $previousState) {


    $previousState.memo("caller");
    window.previousState = $previousState;
    $rootScope.goPrevious = function() {
      $previousState.go('caller');
    };

    $rootScope.API_URL = API_URL;
    $rootScope.pageClass = 'root';
    $rootScope.state = $state;
    $rootScope.S = S;
    window.rootScope = $rootScope;
    window.auth = $auth;

    $rootScope.setPageClass = function(pageClass) {
        $rootScope.pageClass = pageClass
    };

    $rootScope.$on('$routeChangeSuccess', function (ev, next, current) {
        console.log('routeChangeSuccess');
        //flash.error = "You must be an administrator to access that page."
        //$location.path('/')
    });

    $rootScope.$on('$routeChangeError', function (ev, next, current) {
        console.log('Please login.');
    })


    $rootScope.$on('auth:login-success', function(ev, user) {
        console.log('Welcome ', user.email);
    });

    $rootScope.$on('auth:login-error', function(ev, reason) {
        console.log('auth failed because', reason);
    });

    $rootScope.$on('auth:validation-success', function(ev) {
        console.log('auth:validation-success', ev);
        //$state.go('app.dashboard');
    });
    $rootScope.$on('auth:validation-error', function(ev) {
        console.log('auth:validation-error', ev);
        $state.go('auth.index');
    });

    $rootScope.$on('auth:logout-success', function(ev) {
        $state.go('auth.login');
    });



});

'use strict';

angular.module('ngAdmin')
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('app.settings', {
      url: '/settings',
      abstract: true,
      templateUrl: 'app/viewer.html'
    })  
    .state('app.settings.index', {
      url: '/index',
      templateUrl: 'app/settings/settings.html',
      controller: 'SettingsCtrl'
    })
    .state('app.settings.analytics', {
      url: '/analytics',
      templateUrl: 'app/settings/settings-analytics.html',
      controller: 'SettingsAnalyticsCtrl'
    })
    .state('app.settings.properties', {
      url: '/properties',
      templateUrl: 'app/settings/settings-properties.html',
      controller: 'SettingsPropertiesCtrl'
    })    
    .state('app.settings.payments', {
      url: '/payments',
      templateUrl: 'app/settings/settings-payments.html',
      controller: 'SettingsPaymentsCtrl'
    })    
    .state('app.settings.admins', {
      url: '/admins',
      templateUrl: 'app/settings/settings-admins.html',
      controller: 'SettingsAdminsCtrl'
    })    
    .state('app.settings.packages', {
      url: '/packages',
      templateUrl: 'app/settings/settings-packages.html',
      controller: 'SettingsPackagesCtrl'
    })
    .state('app.settings.languages', {
      url: '/languages',
      templateUrl: 'app/settings/settings-languages.html',
      controller: 'SettingsLanguagesCtrl'
    });

    
  })
;

'use strict';

angular.module('ngAdmin')
  .controller('SettingsCtrl', function ($scope, SettingsService, Restangular, FileUploader) {

    window.scope = $scope;
    window.Restangular = Restangular;
    
    var uploader = $scope.uploader = new FileUploader({
        url: 'upload.php',
        withCredentials : false
    });
    $scope.clickUpload = function() {
        $('input[type=file]#imageUpload').click();
    };
    
    $scope.uploading = false;
    $scope.uploading_init = true;
    $scope.uploading_error = false;
    uploader.onAfterAddingAll = function(addedFileItems) {
        $scope.uploading = true;
        console.info('onAfterAddingAll', addedFileItems);
        $scope.uploader.uploadAll();
    };

    uploader.onProgressAll = function(progress) {
        $scope.uploading_init = false;
        console.info('onProgressAll', progress);
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        $scope.uploading_error = true;
        console.info('onErrorItem', fileItem, response, status, headers);
    };

    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
    };

    uploader.onCompleteAll = function() {
        $scope.uploading = false;
        console.info('onCompleteAll');
        $scope.logoPath = API_URL + 'images/logo.png?t=' + _.now();
    };
    
    $scope.saveAnalyticsDetails = function() {
        var params = ['analytics_code'];
        $scope.saveDetails(params);
    }
    
    $scope.saveWebsiteDetails = function() {
		$scope.settings.theme = $scope.selectedTheme;
        var params = ['website_name', 'website_description', 'website_logo', 'theme'];
        $scope.saveDetails(params);   
    }
        
    $scope.saveContactDetails = function() {
        var params = ['company_name', 'address', 'contact_email', 'support_email', 'company_latitude', 'company_longitude'];
        $scope.saveDetails(params);   
    }        
    
    $scope.saveStandardDetails = function() {
        var params = ['timezone', 'default_currency', 'default_country',
                      'initial_lat', 'initial_lng', 'initial_zoom'
                     ];
        $scope.saveDetails(params);   
    }
    
    $scope.saveDetails = function(params) {
        var n = noty({text: 'Saving...', type:'warning', timeout: 2000});
        var settings = _.pick( $scope.settings, params );
        SettingsService.save(settings).then(function(data) {
            var n = noty({text: 'Saved', type:'warning', timeout: 2000});
        }, function(response) {
            var n = noty({text: 'Error saving!', type:'danger', timeout: 2000});
        });
    }

    $scope.countries = [];
    $scope.currencies = [];
    $scope.timezones = [];
    $scope.themes = [];
    $scope.init = function() {
        $scope.showLoader();

        uploader.url = $scope.uploader.url = Restangular.one('settings').getRequestedUrl() + '/upload';
        uploader.formData = [{'imageType': 'logo'}];
        
        $scope.logoPath = Restangular.configuration.baseUrl + '/../../images/logo.png?t=' + _.now();

                 
		SettingsService.getArray().then(function(response) {
			$scope.settings = response;			
			$scope.hideLoader();
		}, function(response) {
			$scope.hideLoader();
		});
			
        Restangular.one('settings').customGET("options").then(function(response) {
            $scope.countries = response.countries;
            $scope.currencies = response.currencies;
            $scope.timezones = response.timezones;
			$scope.themes = response.themes;
       
	   			
			if(!$scope.settings.default_currency) {
				$scope.settings.default_currency = _.first($scope.currencies).code;
			}
						
			if(!$scope.settings.default_country) {
				$scope.settings.default_country = _.first($scope.countries).code;
			}
									
			if(!$scope.settings.timezone) {
				$scope.settings.timezone = _.first($scope.timezones).value;
			}
			$scope.selectedTheme = $scope.settings.theme;
			
        });
		
		
    };
    $scope.init();

});

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

'use strict';

angular.module('ngAdmin')
  .controller('SettingsPaymentsCtrl', function ($scope, PaymentMethodsService) {
	
    $scope.selectedPaymentMethod = [];
    $scope.paymentMethods = [];
	//$scope.paymentMethods.push({"id":1,'status' :0, 'title': 'Loading...', 'handle': 'loading',"nodes":[]});
    $scope.treeOptions = {
        dragStart: function(event) {
            console.log('Start dragging', event);
        },
        dragStop: function(event) {
            console.log('Stop dragging', event);
        },
        dropped: function(event) {
            console.log(event);
            $scope.saveOrder();
        }
    };
    
	$scope.savePaymentMethod = function(paymentMethod) {
        console.log('savePaymentMethod', paymentMethod);
        paymentMethod.saving = true;
        paymentMethod.save().then(function(response) {
            paymentMethod.saving = false;
            console.log("Object saved OK", response);
            var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
        }, function(response) {
            paymentMethod.saving = false;
            var n = noty({text: 'Not saved, please try again', type:'warning', timeout: 2000});
            var errors = response.data.errors;
            console.log(errors);
        });
        
    };
    
    $scope.saveOrder = function() {
        var n = noty({text: 'Saving...', type:'warning', timeout: 2000});
        
        //now save it
        $scope.paymentList.customPOST({'payments': $scope.paymentMethods}, "save-order").then(function(response) {
            var n = noty({text: 'Saved...', type:'warning', timeout: 2000});
        }, function(response) {
           var n = noty({text: 'There was an error saving', type:'warning', timeout: 2000});
            console.log("There was an error saving");       
        });
        
    };
    
    
	$scope.init = function() {
        $scope.showLoader();
        PaymentMethodsService.getList().then(function(data) {
            $scope.paymentList = data;
            $scope.paymentMethods = [];
            _.each(data, function(value) {
                value.nodes = [];
                value.saving = false;
                $scope.paymentMethods.push(value);
            });
            $scope.hideLoader();
            //$scope.paymentMethods = data;
            //console.log(data);
        }); 
    };
	$scope.init();

});

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
'use strict';

angular.module('ngAdmin')
  .controller('SettingsAnalyticsCtrl', function ($scope) {
	
	$scope.init = function() {

    };
	$scope.init();

});

'use strict';

angular.module('ngAdmin')
  .controller('SettingsAdminsCtrl', function ($scope, MemberService, $modal, $stateParams) {

    window.scope = $scope;
    $scope.membersList = null;

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.memberType = 'admin';
    
    $scope.search = "";
    $scope.sort = {};
    $scope.sort.field = 'created_at';
    $scope.sort.direction = 'desc';
    
    $scope.init = function() {
        console.log("GET MEMBERS RESTFULL");
        console.log('memberId', $stateParams['memberType']);
        $scope.pageChanged();
    };


    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
        console.log('$scope.currentPage', $scope.currentPage);
    };

    $scope.performSearch = function() {
        $scope.memberType = 'all';
        $scope.pageChanged();
    };
    
    $scope.pageChanged = function() {
        console.log('Page changed to: ' + $scope.currentPage);

        // This will query /members and return a promise.
        $scope.showLoader();
        MemberService.getList( {memberType: $scope.memberType, page: $scope.currentPage, sortField: $scope.sort.field, sortDirection: $scope.sort.direction, search: $scope.search}).then(function(members) {
            $scope.membersList = members;

            $scope.pageInfo = members.meta;
            $scope.currentPage = members.meta.current_page;
            $scope.totalItems = members.meta.total;
            $scope.hideLoader();
            //$scope.currentPage = members.total;
        });

    };
    
    $scope.addNewAdmin = function() {

        var modalInstance = $modal.open({
            templateUrl: 'app/settings/settings-admins-create.html',
            controller: 'SettingsAdminsCreateCtrl',
            size: 'md'
        });

        modalInstance.result.then(function (selectedItem) {
            console.log("SUCCESS");
            $scope.pageChanged();
        }, function () {
            console.log("CLOSED");
        });

    };
    
    $scope.deleteMember = function(member) {
        //show pop-up        
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this member!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, delete it!',
            closeOnConfirm: false
        },
        function(){
            swal.close();
            var n = noty({text: 'Deleting...', type:'warning', timeout: 2000});
            member.remove().then(function(response) {
                $scope.pageChanged();
                var n = noty({text: 'Deleted', type:'warning', timeout: 2000});
            }, function() {
                var n = noty({text: "There was an error deleting", type:'warning', timeout: 2000});
                console.log("There was an error deleting");
            });
            
        });

    };

    $scope.showPermissions = function(permissions) {
        return permissions.join();
    };
    
    $scope.tableSort = function(field) {
        
        if($scope.sort.direction == 'desc' && $scope.sort.field == field) {
            $scope.sort.direction = 'asc';
        } else if($scope.sort.direction == 'asc' && $scope.sort.field == field) {
            $scope.sort.direction = 'desc';
        } else {
            $scope.sort.direction = 'desc';
        }
        
        $scope.sort.field = field;
        $scope.currentPage = 1;
        $scope.pageChanged();
    };


    $scope.init();

});

'use strict';

angular.module('ngAdmin')
  .controller('SettingsAdminsCreateCtrl', function ($scope, MemberService, $state) {
	window.scope = $scope;
	$scope.member = {
        is_admin: 1,
        admin_permissions: []
    };
	
    $scope.permissions = ['properties', 'members', 'transactions', 'settings', 'pages', 'navigation', 'languages'];
    $scope.selectedPermissions = ['properties', 'members'];
    
          // toggle selection for a given fruit by name
      $scope.toggleSelection = function toggleSelection(permissionName) {
        var idx = $scope.member.admin_permissions.indexOf(permissionName);

        // is currently selected
        if (idx > -1) {
          $scope.member.admin_permissions.splice(idx, 1);
        }

        // is newly selected
        else {
          $scope.member.admin_permissions.push(permissionName);
        }
      };
    
    $scope.title = "Add new member";
	$scope.view = 'agent';
    $scope.errors = {};
	$scope.init = function() {
		
    };	
    $scope.dismiss = function() {
        $scope.$dismiss();
    };
    $scope.submitForm = function(isValid) {
        if(isValid) {
            var n = noty({text: 'Saving...', type:'warning', timeout: 2000});
            MemberService.post($scope.member).then(function(response) {
                if(response.status == 'success') {
                    var n = noty({text: 'Saved', type:'warning', timeout: 2000});
                }
                $scope.$close($scope.member);
              }, function(response) {
                var n = noty({text: 'There was an error saving', type:'warning', timeout: 2000});
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
	$scope.init();

});

'use strict';

angular.module('ngAdmin')
.controller('PaymentMethodCtrl', function ($scope, $http, ContentService) {

    window.scope = $scope;
    $scope.errors = {};
    $scope.loading = false;
    $scope.linkTypes = [
        {type: 'url', name: 'URL'},
        {type: 'page', name: 'Page'},
        {type: 'property', name: 'Property'}
    ];
    $scope.linkTypeLabel = "test";
    /*$scope.changeLinkType = function() {
        $scope.setLinkType();
        $scope.selectedPage.selected = {};
        $scope.link.value = {};
    }
    $scope.setLinkType = function() {
        console.log($scope.linkTypeLabel, $scope.link);
        switch ($scope.paymentMethod.type) {
            case 'page':
                $scope.linkTypeLabel = "Select page";
                if(!angular.isUndefined($scope.paymentMethod.value)) {
                    $scope.selectedPage.selected = $scope.paymentMethod.value;
                }
                break;
            case 'property':
                $scope.linkTypeLabel = "Select property";
                if(!angular.isUndefined($scope.paymentMethod.value)) {
                    $scope.selectedPage.selected = $scope.paymentMethod.value;
                }
                break;
            case 'url':
                $scope.linkTypeLabel = "Web address";
                break;
        }

    };
    
    $scope.selectedPage = {};
    $scope.pageList = [];
    $scope.updatePageLink = function() {
        console.log('$scope.selectedPage', $scope.selectedPage);
        $scope.link.value = {id : $scope.selectedPage.selected.page_id, title: $scope.selectedPage.selected.title };
    };
    $scope.spinner = false;
    $scope.searchPages = function($select) {
        if($select.search.length < 1)
            return false;
        $scope.spinner = true;
        return ContentService.getList( {currentLang: $scope.currentLang, page: 1, sortField: 'title', sortDirection: 'ASC', search: $select.search}).then(function(pages) {
            $scope.pageList = pages;
            $scope.spinner = false;
        }, function() {
            $scope.spinner = false;
        });
        
    };
*/
    $scope.init = function() {
        console.log("partial")
        if(angular.isUndefined($scope.paymentMethod.type)) {
            $scope.paymentMethod.type = _.findWhere($scope.linkTypes, {'type': 'page'}).type;
        } else {
            
        }
        
        //$scope.setLinkType();
    };

    $scope.init();

});

'use strict';

angular.module('ngAdmin')
.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('app.regions', {
        url: '/regions',
        abstract: true,
        templateUrl: 'app/viewer.html',
        data: {
            requireLogin: true
        }
    })  
    .state('app.regions.index', {
        url: '/index',
        templateUrl: 'app/regions/regions.html',
        controller: 'RegionsCtrl',
        data: {
            requireLogin: true
        }
    })    
    .state('app.regions.create', {
        url: '/create',
        templateUrl: 'app/regions/regions-edit.html',
        controller: 'RegionsCreateCtrl'
    })
    .state('app.regions.edit', {
        url: '/edit/:regionId',
        templateUrl: 'app/regions/regions-edit.html',
        controller: 'RegionsEditCtrl'
    });

});

'use strict';

angular.module('ngAdmin')
    .controller('RegionsCtrl', function ($scope, RegionService, $modal, $stateParams) {

    window.scope = $scope;
    $scope.regionsList = null;

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    /*
    $scope.localeChoicesData = [
        {'code':'en', 'name':'English'},
        {'code':'fr', 'name':'French'},
        {'code':'de', 'name':'German'},
        {'code':'nl', 'name':'Dutch'}
    ];
    $scope.localeChoices = _.pluck($scope.localeChoicesData, 'code');
*/
    $scope.search = "";
    $scope.sortOptions = [
        { field:'name', direction:'asc', name:'Name (A-Z)' },
        { field:'updated_at', direction:'desc', name:'Date created (Newest to oldest)' },
        { field:'updated_at', direction:'asc', name:'Date created (Oldest to newest)' },
    ];
    $scope.sort = _.first($scope.sortOptions);
    
    $scope.init = function() {
        console.log("GET CONTENT RESTFULL");
        console.log('currentLocale', $stateParams['currentLocale']);
        console.log('currentLocale', $scope.localesList);

        if(!angular.isUndefined($stateParams['currentLocale']) && $stateParams['currentLocale'] != '') {
            $scope.currentLocale = $stateParams['currentLocale'];
        }

        $scope.pageChanged();
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
        console.log('$scope.currentPage', $scope.currentPage);
    };

    $scope.changeLocale = function() {
        $scope.pageChanged();
    };

    $scope.performSearch = function() {
        $scope.pageChanged();
    };

    $scope.pageChanged = function() {
        console.log('Page changed to: ' + $scope.currentPage);

        // This will query /members and return a promise.
        $scope.showLoader();
        RegionService.getList( {currentLocale: $scope.currentLocale, page: $scope.currentPage, sortField: $scope.sort.field, sortDirection: $scope.sort.direction, search: $scope.search}).then(function(pages) {
            $scope.regionsList = pages;

            //localeChoices
            _.each($scope.regionsList, function(page) {

                var translatedPages = _.pluck(page.translations, 'locale');
                console.log('translatedPages', translatedPages);
                page.translated = {};
                _.each($scope.localesList, function(pageLocale) {
                    page.translated[pageLocale.code] = _.contains(translatedPages, pageLocale.code);
                });

                //console.log('MISSING '+page.id, missingPages);
            });


            $scope.pageInfo = pages.meta;
            $scope.currentPage = pages.meta.current_page;
            $scope.totalItems = pages.meta.total;
            $scope.hideLoader();
            //$scope.currentPage = members.total;
        });

    };



    $scope.tableSort = function(field) {

        if($scope.sort.direction == 'desc' && $scope.sort.field == field) {
            $scope.sort.direction = 'asc';
        } else if($scope.sort.direction == 'asc' && $scope.sort.field == field) {
            $scope.sort.direction = 'desc';
        } else {
            $scope.sort.direction = 'desc';
        }

        $scope.sort.field = field;
        $scope.currentPage = 1;
        $scope.pageChanged();
        
    };

    
        
    $scope.regionEdit = function(regionId, pageLang) {

        var modalInstance = $modal.open({
            templateUrl: 'app/regions/regions-edit.html',
            controller: 'RegionsEditCtrl',
            size: 'md',
            resolve: {
                regionId: function () {
                  return regionId;
                },
                currentLocale: function () {
                  return pageLang;
                }
            }
        });
    
        modalInstance.result.then(function (selectedItem) {
            console.log("SUCCESS");
        }, function () {
            console.log("CLOSED");
        });
        
    };
    

    $scope.init();
});

'use strict';

angular.module('ngAdmin')
    .controller('RegionsEditCtrl', function ($scope, $stateParams, $timeout, RegionService, S, regionId, currentLocale) {
    window.scope = $scope;

    $scope.regionId = regionId;
    $scope.currentLocale = currentLocale;
    $scope.loading = true;

    $scope.submitForm = function() {
        $("#form").alpaca('get').form.submit();
    }    

    $scope.dismiss = function() {
        
        try {
            $("#form").alpaca('destroy');
        } catch(err) {
        }
        
        $scope.$dismiss();
    };

    $scope.onSubmit = function(val) {
        $scope.saving = true;
console.log(val);
        $scope.region.customPOST({form:val, regionId:$scope.regionId, locale:$scope.currentLocale}).then(function(response) {
            $scope.saving = false;
            var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
            $scope.$close();
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

            console.log("There was an error saving", response);
        });
    }

    $scope.setupForm = function() {
        console.log('############# setupForm');
        
        var form_options = {};
        form_options['form'] = {
            "attributes":{
                "action":"http://www.httpbin.org/post",
                "method":"post",
                "enctype":"multipart/form-data"
            },
            "buttons":{}
        };
        jQuery.extend(form_options, $scope.region.meta.options);
        console.log(form_options);
        
        console.log($scope.region.meta.optionsSource);
        $timeout(function() {
            $("#form").alpaca({
                "data": $scope.region.meta.data,
                "options": form_options,
                "schema": $scope.region.meta.schema,
                "postRender": function(renderedField) {
                    var form = renderedField.form;
                    if (form) {
                        form.registerSubmitHandler(function(e, form) {
                            form.validate(true);
                            form.refreshValidationState(true);
                            if (form.isFormValid()) {
                                var val = form.getValue();
                                $scope.onSubmit(val);
                            } else {
                                alert("Invalid value: " + JSON.stringify(val, null, "  "));
                            }
                            e.stopPropagation();
                            return false;
                        });
                    }
                }
            });
        }, 500);


    };

    $scope.init = function() {
        console.log('############# INIT');
        RegionService.one($scope.regionId).one($scope.currentLocale).get().then(function(data) {
            $scope.region = data;
            
            $scope.loading = false;
            $scope.setupForm();
        });



    };

    $scope.init();

});        


'use strict';

angular.module('ngAdmin')
  .controller('PagesCreateCtrl', function ($scope, ContentService, S) {
    
    // setup editor options
    $scope.editorOptions = {
        uiColor: '#e2e2e2'
    };
    
    $scope.editor = 'content';
    $scope.title = "Create new page";
    
    $scope.page = {};
    $scope.page.locale = 'en';
    
    $scope.slugify = function(input) {
        $scope.page.slug = S(input).slugify().s;
    };
    
    $scope.submitForm = function(isValid) {
        if(isValid) {
            ContentService.post($scope.page).then(function(response) {
                console.log("Object saved OK", response);
                if(response.type == 'prospect') {
                    var n = noty({text: 'Success - A new prospect was added', type:'warning', timeout: 2000});
                }
                $scope.dismiss(response);
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
        
    $scope.init = function() {

    };
    
    $scope.init();


});

'use strict';

angular.module('ngAdmin')
  .config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
    .state('app.prospects', {
      url: '/prospects',
      abstract: true,
      templateUrl: 'app/viewer.html'
    })  
    .state('app.prospects.index', {
      url: '/list/:memberType',
      templateUrl: 'app/prospects/prospects.html',
      controller: 'ProspectsCtrl'
    });
    
});
'use strict';

angular.module('ngAdmin')
.controller('ProspectsCtrl', function ($scope, ProspectService, $modal, $stateParams) {

    window.scope = $scope;
    $scope.membersList = null;

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.memberType = 'unregistered_prospect';
    
    $scope.search = "";
    $scope.sort = {};
    $scope.sort.field = 'created_at';
    $scope.sort.direction = 'desc';
    
    $scope.init = function() {
        console.log("GET MEMBERS RESTFULL");
        console.log('memberId', $stateParams['memberType']);
        
        if(!angular.isUndefined($stateParams['memberType']) && $stateParams['memberType'] != '') {
            $scope.memberType = $stateParams['memberType'];
            
        }

        $scope.pageChanged();
    };


    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
        console.log('$scope.currentPage', $scope.currentPage);
    };

    $scope.performSearch = function() {
        $scope.memberType = 'all';
        $scope.pageChanged();
    };
    
    $scope.pageChanged = function() {
        console.log('Page changed to: ' + $scope.currentPage);

        // This will query /members and return a promise.
        $scope.showLoader();
        ProspectService.getList( {memberType: $scope.memberType, page: $scope.currentPage, sortField: $scope.sort.field, sortDirection: $scope.sort.direction, search: $scope.search}).then(function(members) {
            $scope.membersList = members;

            $scope.pageInfo = members.meta;
            $scope.currentPage = members.meta.current_page;
            $scope.totalItems = members.meta.total;
            $scope.hideLoader();
            //$scope.currentPage = members.total;
        });

    };
    
    $scope.addNewMember = function() {

        var modalInstance = $modal.open({
            templateUrl: 'app/members/members-create.html',
            controller: 'MembersCreateCtrl',
            size: 'md'
        });

        modalInstance.result.then(function (selectedItem) {
            console.log("SUCCESS");
        }, function () {
            console.log("CLOSED");
        });

    };
    
    $scope.tableSort = function(field) {
        
        if($scope.sort.direction == 'desc' && $scope.sort.field == field) {
            $scope.sort.direction = 'asc';
        } else if($scope.sort.direction == 'asc' && $scope.sort.field == field) {
            $scope.sort.direction = 'desc';
        } else {
            $scope.sort.direction = 'desc';
        }
        
        $scope.sort.field = field;
        $scope.currentPage = 1;
        $scope.pageChanged();
    };
    
    $scope.deleteMember = function(prospect) {
        //show pop-up        
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this prospect!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, delete it!',
            closeOnConfirm: false
        },
        function(){
            swal.close();
            var n = noty({text: 'Deleting...', type:'warning', timeout: 2000});
            prospect.remove().then(function(response) {
                var n = noty({text: 'Deleted', type:'warning', timeout: 2000});
                $scope.pageChanged();
            }, function() {
                var n = noty({text: "There was an error deleting", type:'warning', timeout: 2000});
                console.log("There was an error deleting");
            });
            
        });

    };


    $scope.init();

});



'use strict';

angular.module('ngAdmin')
  .controller('PropertyListCtrl', function ($scope, PropertyService, PropertyTypeService, SettingsService, $modal, $q, $state) {
    
    window.scopeList = $scope;
    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    
    $scope.search = "";
    $scope.sort = {};
    $scope.sort.field = 'created_at';
    $scope.sort.direction = 'desc';
    
    $scope.setCurrentPage('properties');
    $scope.propertyTypes = null;

	$scope.getPropertyTypes = function() {
        var d = $q.defer();
        PropertyTypeService.getList().then(function(response) {
            d.resolve(response);
        }, function(response) {
            d.reject(response);
        });
        return d.promise;
    }
    
    $scope.addNewProperty = function() {

        var modalInstance = $modal.open({
            templateUrl: 'app/properties/property-create.html',
            controller: 'PropertyCreateCtrl',
            size: 'md',
            resolve: {
                propertyTypes: function () {
                  return $scope.propertyTypes;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            console.log("SUCCESS");
            $scope.pageChanged();
        }, function () {
            console.log("CLOSED");
        });

    };
    
    $scope.nextPage = function() {
        $scope.setPage($scope.pageInfo.next_page);
    };
    
    $scope.previousPage = function() {
        $scope.setPage($scope.pageInfo.prev_page);
    };    
    
    $scope.performSearch = function() {
        $scope.pageChanged();
    };

    $scope.pageChanged = function() {
        console.log('Page changed to: ' + $scope.currentPage);

        // This will query /members and return a promise.
        $scope.showListLoader();        
        var params = {currentLocale: $scope.currentLocale, page: $scope.currentPage, sortField: $scope.sort.field, sortDirection: $scope.sort.direction, search: $scope.search};
        params = $.extend({}, params, $scope.searchParams);
        console.log('params', params);
        PropertyService.getList(params).then(function(properties) {
            
            if($state.current.name != 'app.properties.edit') {
                var property = _.first(properties);
                console.log('app.properties.edit', property);
				if(!_.isUndefined(property)) {
					$state.go("app.properties.edit", {propertyId:property.id});
				} else {
					$state.go("app.properties.edit", {propertyId:0});
				}
            }
            
            $scope.propertiesList = properties;
            
            console.log('propertiesList', $scope.propertiesList);
            
            $scope.pageInfo = properties.meta;
            $scope.pageInfo.next_page = $scope.pageInfo.last_page;
            if($scope.pageInfo.next_page_url) {
                $scope.pageInfo.next_page = URI($scope.pageInfo.next_page_url).query(true).page; 
                console.log('next_page_url', $scope.pageInfo.next_page_url, $scope.pageInfo.next_page);
            }            
            $scope.pageInfo.prev_page = 1;
            if($scope.pageInfo.prev_page_url) {
                console.log('prev_page_url', $scope.pageInfo.prev_page_url);
                $scope.pageInfo.prev_page = URI($scope.pageInfo.prev_page_url).query(true).page; 
            }
            $scope.currentPage = properties.meta.current_page;
            $scope.totalItems = properties.meta.total;
            $scope.hideListLoader();
            //$scope.currentPage = members.total;
        });

    };
    
    $scope.showContent = function() {

        $('.listings-bar').addClass('hidden-xs hidden-sm');
        $('.listings-wrapper').removeClass('hidden-xs hidden-sm');
    };

    $scope.showMenu = function() {

        $('.listings-bar').removeClass('hidden-xs hidden-sm');
        $('.listings-wrapper').addClass('hidden-xs hidden-sm');
    };

    $scope.searchOptions = {};
    $scope.searchParams = {};
    $scope.submitForm = function() {
        console.log($scope.searchParams);
        $scope.performSearch();
    };
    
    $scope.setupSearch = function() {
        
        $scope.searchOptions['min_beds'] = [
            {value:null, name:'No min beds'},
            {value:0, name:'Studio'},
            {value:1, name:'1 bed'},
            {value:2, name:'2 beds'},
            {value:3, name:'3 beds'},
            {value:4, name:'4 beds'},
            {value:5, name:'5 beds'}
        ];
        
        $scope.searchOptions['max_beds'] = [
            {value:null, name:'No max beds'},
            {value:0, name:'Studio'},
            {value:1, name:'1 bed'},
            {value:2, name:'2 beds'},
            {value:3, name:'3 beds'},
            {value:4, name:'4 beds'},
            {value:5, name:'5 beds'}
        ];
                
        $scope.searchOptions['listing_types'] = [
            {value:null, name:'Sale/Rent'},
            {value:'sale', name:'Sale'},
            {value:'rent', name:'Rent'}
        ];
        
    };
    
    $scope.init = function() {
        
        $scope.pageChanged();
        $scope.setupSearch();
        $scope.getPropertyTypes().then(function(response) {
            $scope.propertyTypes = response;
        }, function(response) {
        });
        
    };

    
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
        console.log('$scope.currentPage', $scope.currentPage);
        $scope.pageChanged();
    };
    
    $scope.tableSort = function(field) {

        if($scope.sort.direction == 'desc' && $scope.sort.field == field) {
            $scope.sort.direction = 'asc';
        } else if($scope.sort.direction == 'asc' && $scope.sort.field == field) {
            $scope.sort.direction = 'desc';
        } else {
            $scope.sort.direction = 'desc';
        }

        $scope.sort.field = field;
        $scope.currentPage = 1;
        $scope.pageChanged();
    };
    
    $scope.init();
    
        
    $scope.preloadContent = function (propertyId) {
        $scope.showEditor();
        if(propertyId != $scope.propertyId) {
            $scope.showPropertyLoader();
            
            //$state.go('app.properties.edit', {propertyId: propertyId}, {location:"replace", inherit:false} );
        }
    };
    
    $scope.deleteProperty = function(property) {
        //show pop-up        
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover the property:<br /><strong>" + property.title + '</strong>',
			html: true,
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
            property.remove().then(function(response) {
                $scope.hideLoader();                
                var n = noty({text: 'Property deleted successfully', type:'warning', timeout: 2000});
                $scope.pageChanged();
            }, function() {
                $scope.hideLoader();
                var n = noty({text: "There was an error deleting", type:'warning', timeout: 2000});
                console.log("There was an error deleted");
            });
            
        });
    };
	
});

'use strict';

angular.module('ngAdmin')
  .controller('PropertyEditPricingCtrl', function ($scope, $stateParams, PropertyService) {

    $scope.saving  = false;
    $scope.submitForm = function(isValid) {
        console.log('PropertyEditPricingCtrl');
        console.log($scope.property);
        //return;
        
        var data = {};
        data['price'] = $scope.property.price;
        data['reduced_price'] = $scope.property.reduced_price;
        data['negotiable_price'] = $scope.property.negotiable_price;
        data['poa'] = $scope.property.poa;
        data['price_period'] = $scope.property.price_period;
        data['price_type'] = $scope.property.price_type;
        
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
    
    /*
	$scope.init = function() {
        console.log("GENERAL CONTRLLER", $stateParams);
    };
	
	$scope.init();*/

});

'use strict';
var url;
angular.module('ngAdmin')
    .controller('PropertyEditImagesCtrl', function ($scope, $stateParams, PropertyService, FileUploader, $auth) {

	window.auth = $auth;
    $scope.imageType = 'photos';
    var uploader = $scope.uploader = new FileUploader({
        url: 'upload.php',
        withCredentials : false,
		headers : $auth.persistData().auth_headers
    });

    $scope.resizeEditable = function() {
        $('.image-panel').width() - 39
    };
	
    $scope.init = function() {
        uploader.url = $scope.uploader.url = $scope.property.one('upload').getRequestedUrl();
        uploader.formData = [{'imageType': $scope.imageType}];

        $scope.changeCaptions();


        //console.log(url);
        console.log("PropertyEditImagesCtrl CONTRLLER", $stateParams);
    };	

    $scope.clickUpload = function() {
        $('input[type=file]#imageUpload').click();
    };

    $scope.uploading = false;
    $scope.uploading_init = true;
    $scope.uploading_error = false;
    uploader.onAfterAddingAll = function(addedFileItems) {
        $scope.uploading = true;
        console.info('onAfterAddingAll', addedFileItems);
        $scope.uploader.uploadAll()
    };

    uploader.onProgressAll = function(progress) {
        $scope.uploading_init = false;
        console.info('onProgressAll', progress);
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        $scope.uploading_error = true;
        console.info('onErrorItem', fileItem, response, status, headers);
    };

    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
        $scope.property[response.imageType] = response.files;
    };

    uploader.onCompleteAll = function() {
        $scope.uploading = false;
        console.info('onCompleteAll');
    };

    $scope.$watch('property', function() {
        if($scope.property) {
            $scope.init();
        }
    });

    $scope.addVirtualTour = function() {
        $scope.translation[$scope.imageType].push({'url':'', 'caption':''});
    };

    $scope.changeCaptions = function() {
        if(_.isNull($scope.property)) {
            return false;
        }
        _.each($scope.property[$scope.imageType], function(image) {

            if( !_.isNull($scope.translation[$scope.imageType]) && !_.isUndefined($scope.translation[$scope.imageType][image.file])  ) {
                image.caption = $scope.translation[$scope.imageType][image.file];   
            }

        });
    }


    $scope.saveDisabled = true;
    $scope.$watch('imageType', function() {
        uploader.formData = [{'imageType': $scope.imageType}];        
        $scope.changeCaptions();

        if($scope.imageType == 'virtual_tours') {
            $scope.saveDisabled = false;
        } else {
            $scope.saveDisabled = true;
        }

        console.log('$scope.saveDisabled', $scope.saveDisabled);

    });

    $scope.submitVirtualTours = function(isValid) {
        
        console.log('submitVirtualTours');
        console.log($scope.property);
        //return;
        
        var data = [];
        data['virtual_tours'] = JSON.stringify($scope.translation[$scope.imageType]);
        data['locale'] = $scope.currentLocale;
        console.log(data);
        //if(isValid) {
            //$scope.property.translationsJson = JSON.stringify($scope.translations);
            $scope.property.one('update_virtual_tours')
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
        //}
 	  
        return false;
        
    };
    
    $scope.deleteImage = function(imageType, file) {
        var params = {};
        params.imageType = $scope.imageType;
        params.file = file;

        $scope.property.one('delete_image')
            .customPOST(params)
            .then(function(response) {
            var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
            $scope.property[response.imageType] = response.files;
        }, function(response) {

        });
    };

    $scope.updateCaption = function(image, data) {
        console.log($scope.property.id, $scope.imageType, image, data);
        var params = {};
        params.imageType = $scope.imageType;
        params.file = image.file;
        params.caption = data;
        params.locale = $scope.currentLocale;

        $scope.property.one('update_image')
            .customPOST(params)
            .then(function(response) {
            var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
        }, function(response) {

        });
        //return $http.post('/updateUser', {id: $scope.user.id, name: data});
    };

    $scope.getThumbnail = function(propertyId, imageType, imageFile) {
        return API_URL + 'property_images/177x117/'+propertyId+'/'+imageType+'-'+imageFile;
    };


});



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

'use strict';

angular.module('ngAdmin')
  .controller('PropertyCreateCtrl', function ($scope, PropertyService, propertyTypes, $state) {
    
    $scope.propertyTypes = propertyTypes;
    window.scopeModal = $scope;
    $scope.errors = {};
    $scope.property = {};
    $scope.loading = false;	
    
    $scope.dismiss = function() {
        $scope.$dismiss();
    };
    
    $scope.submitForm = function(isValid) {
        if(isValid) {
            $scope.loading = true;
            PropertyService.post($scope.property).then(function(response) {
                $scope.loading = false;
                console.log("Object saved OK", response);
                noty({text: 'Listing added! - complete the property details to publish', type:'warning', timeout: 2000});
                $scope.$close(response);
                $state.go('app.properties.edit', {propertyId: response.property.id});
              }, function(response) {
                $scope.loading = false;
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
        console.log($scope.propertyTypes);
    };
    
	$scope.init();

});

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

'use strict';

angular.module('ngAdmin')
.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('app.pages', {
        url: '/pages',
        abstract: true,
        templateUrl: 'app/viewer.html',
        data: {
            requireLogin: true
        }
    })  
    .state('app.pages.index', {
        url: '/index',
        templateUrl: 'app/pages/pages.html',
        controller: 'PagesCtrl',
        data: {
            requireLogin: true
        }
    })    
    .state('app.pages.create', {
        url: '/create',
        templateUrl: 'app/pages/pages-edit.html',
        controller: 'PagesCreateCtrl'
    })
    .state('app.pages.edit', {
        url: '/edit/:pageId/:locale',
        templateUrl: 'app/pages/pages-edit.html',
        controller: 'PagesEditCtrl'
    });

});

'use strict';

angular.module('ngAdmin')
    .controller('PagesCtrl', function ($scope, ContentService, $modal, $stateParams) {

    window.scope = $scope;
    $scope.pagesList = null;

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    /*
    $scope.localeChoicesData = [
        {'code':'en', 'name':'English'},
        {'code':'fr', 'name':'French'},
        {'code':'de', 'name':'German'},
        {'code':'nl', 'name':'Dutch'}
    ];
    $scope.localeChoices = _.pluck($scope.localeChoicesData, 'code');
*/
    $scope.search = "";
    $scope.sortOptions = [
        { field:'title', direction:'asc', name:'Title (A-Z)' },
        { field:'updated_at', direction:'desc', name:'Date created (Newest to oldest)' },
        { field:'updated_at', direction:'asc', name:'Date created (Oldest to newest)' },
    ];
    $scope.sort = _.first($scope.sortOptions);
    
    $scope.init = function() {
        console.log("GET CONTENT RESTFULL");
        console.log('currentLocale', $scope.currentLocale);
        console.log('currentLocale', $stateParams['currentLocale']);
        console.log('currentLocale', $scope.localesList);

        if(!angular.isUndefined($stateParams['currentLocale']) && $stateParams['currentLocale'] != '') {
            $scope.currentLocale = $stateParams['currentLocale'];
        }

        $scope.pageChanged();
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
        console.log('$scope.currentPage', $scope.currentPage);
    };

    $scope.changeLocale = function() {
        $scope.pageChanged();
    };

    $scope.performSearch = function() {
        $scope.pageChanged();
    };

    $scope.pageChanged = function() {
        console.log('Page changed to: ' + $scope.currentPage);

        // This will query /members and return a promise.
        $scope.showLoader();
        ContentService.getList( {currentLocale: $scope.currentLocale, page: $scope.currentPage, sortField: $scope.sort.field, sortDirection: $scope.sort.direction, search: $scope.search}).then(function(pages) {
            $scope.pagesList = pages;

            //localeChoices
            _.each($scope.pagesList, function(page) {

                var translatedPages = _.pluck(page.translations, 'locale');
                console.log('translatedPages', translatedPages);
                page.translated = {};
                _.each($scope.localesList, function(pageLocale) {
                    page.translated[pageLocale.code] = _.contains(translatedPages, pageLocale.code);
                });

                //console.log('MISSING '+page.id, missingPages);
            });


            $scope.pageInfo = pages.meta;
            $scope.currentPage = pages.meta.current_page;
            $scope.totalItems = pages.meta.total;
            $scope.hideLoader();
            //$scope.currentPage = members.total;
        });

    };

    $scope.addNewMember = function() {

        var modalInstance = $modal.open({
            templateUrl: 'app/members/members-create.html',
            controller: 'MembersCreateCtrl',
            size: 'md'
        });

        modalInstance.result.then(function (selectedItem) {
            console.log("SUCCESS");
        }, function () {
            console.log("CLOSED");
        });

    };

    $scope.tableSort = function(field) {

        if($scope.sort.direction == 'desc' && $scope.sort.field == field) {
            $scope.sort.direction = 'asc';
        } else if($scope.sort.direction == 'asc' && $scope.sort.field == field) {
            $scope.sort.direction = 'desc';
        } else {
            $scope.sort.direction = 'desc';
        }

        $scope.sort.field = field;
        $scope.currentPage = 1;
        $scope.pageChanged();
        
    };

    $scope.deletePage = function(page) {
        //show pop-up        
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this page!",
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
            page.remove().then(function(response) {
                $scope.hideLoader();                
                var n = noty({text: 'Page deleted successfully', type:'warning', timeout: 2000});
                $scope.pageChanged();
            }, function() {
                $scope.hideLoader();
                var n = noty({text: "There was an error deleting", type:'warning', timeout: 2000});
                console.log("There was an error deleted");
            });
            
        });
        //delete

    };

    $scope.init();
});

'use strict';

angular.module('ngAdmin')
  .controller('PagesEditCtrl', function ($scope, $stateParams, ContentService, S, $modal) {
    window.scope = $scope;
    // setup editor options
    $scope.editorOptions = {
        uiColor: '#e2e2e2'
    };
    
    $scope.viewMode = 'edit';
    $scope.saving = false;
    $scope.editor = 'content';
    $scope.title = "Editing page";
    
    $scope.content = {};
    $scope.page = null;
    $scope.translation = {};
    
    $scope.slugify = function(input) {
        $scope.page.slug = getSlug(input);
    };
    
    
    $scope.submitForm = function(isValid) {
        console.log("Editing page", $scope.page);
        if(isValid) {
            $scope.saving = true;
            var params = {};
            $scope.page.save().then(function(response) {
                $scope.saving = false;
                var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});                
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
                
                console.log("There was an error saving", response);
              });
        }
 	  
        return false;
    };
    
    $scope.templates = [];
	$scope.init = function() {
        
        $scope.pageId = $stateParams['pageId'];
        $scope.pageLang = $stateParams['locale'];
        
        $scope.showLoader();
        ContentService.one($scope.pageId).one($scope.pageLang).get().then(function(data) {
            console.log(data);
            /*$scope.translation = data.translation;
            $scope.content = data.page;*/
            $scope.templates = data.meta.templates;

            $scope.page = data;

            console.log("page", data);
            $scope.hideLoader();
        });

        console.log('memberId', $stateParams);
        
    };
    
    $scope.init();
    
    
    $scope.regionEdit = function(regionId) {

        var modalInstance = $modal.open({
            templateUrl: 'app/regions/regions-edit.html',
            controller: 'RegionsEditCtrl',
            size: 'md',
            resolve: {
                regionId: function () {
                  return regionId;
                },
                currentLocale: function () {
                  return $scope.pageLang;
                }
            }
        });
    
        modalInstance.result.then(function (selectedItem) {
            console.log("SUCCESS");
        }, function () {
            console.log("CLOSED");
        });
        
    };
    
});        


'use strict';

angular.module('ngAdmin')
  .controller('PagesCreateCtrl', function ($scope, ContentService, S, Restangular, $state) {
    
    // setup editor options
    $scope.editorOptions = {
        uiColor: '#e2e2e2'
    };
    
    $scope.viewMode = 'create';
    $scope.editor = 'content';
    $scope.title = "Create new page";
    
    $scope.page = {};
    $scope.page.locale = 'en';
    
    $scope.slugify = function(input) {
        $scope.page.slug = getSlug(input);
    };
    
    $scope.submitForm = function(isValid) {
        if(isValid) {
            ContentService.post($scope.page).then(function(response) {
					console.log("Object saved OK", response);
					var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
					$state.go('app.pages.index');
              }, function(response) {
					var errorList = response.data;
					console.log(errorList);
					var error = '';
					angular.forEach(errorList, function(errors, field) {
						error = errors;
						console.log('field', field, errors, angular.isUndefined($scope.form[field]));
						if(!angular.isUndefined($scope.form[field])) {
							$scope.form[field].$setValidity('server', false);
							
							return $scope.errors[field] = errors.join(', ');
						}
					});
					noty({text: 'ERROR:' + error, type:'error', timeout: 2000})
					console.log("There was an error saving", response, response.data);
              });
        }
 	  
        return false;

    };

    $scope.init = function() {
        Restangular.one('content').customGET("config").then(function(response) {
            console.log(response);
            $scope.templates = data.templates;
            if(data.templates.length) {
                $scope.page.template = _.first(data.templates).view;
            }
        });
    };
    
    $scope.init();


});

'use strict';

angular.module('ngAdmin')
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
	  .state('app.navigation', {
        url: '/navigation',
		abstract: true,
        templateUrl: 'app/viewer.html'
      })  
	  .state('app.navigation.index', {
        url: '/index',
        templateUrl: 'app/navigation/navigation.html',
		controller: 'NavigationCtrl'
      })
	  .state('app.navigation.edit', {
        url: '/edit',
        templateUrl: 'app/navigation/navigation-edit.html',
        controller: 'NavigationEditCtrl'
      });

  })
;

'use strict';

angular.module('ngAdmin')
.controller('NavigationCtrl', function ($scope, $modal, MenuService, Restangular, $q) {
	
    window.scope = $scope;
    $scope.showAdditional = false;

    $scope.menuList = [];
    $scope.menuData = [];
    
    $scope.addNewMenu = function() {

        var modalInstance = $modal.open({
            templateUrl: 'app/navigation/navigation-create.html',
            controller: 'NavigationCreateCtrl',
            size: 'md'
        });

        modalInstance.result.then(function (selectedItem) {
            console.log("SUCCESS");
            $scope.refreshMenus();
        }, function () {
            console.log("CLOSED");
        });

    };

    $scope.addToMenu = function() {
        var json = angular.toJson($scope.menuData);
        console.log(json);
        var count = (json.match(/id/g) || []).length;
        var tmp = {
            "id": count + 1,
            "title": "Untitled " + (count +1),
            "nodes": []
        };
        $scope.menuData.push(tmp);
    };
    
    $scope.changeLanguage = function() {
        $scope.switchMenu($scope.selectedMenu);
    };
    
    $scope.switchMenu = function(menu) {
        $scope.selectedMenu = menu;
        console.log('menu.data', menu.name, menu.data);
        
        if(_.isNull(menu.data) ) {
            menu.data = {}
        } else {
            menu.data = angular.fromJson(menu.data);   
        }
        
        if(_.size(menu.data[$scope.currentLocale]) > 0) {
            $scope.menuData = menu.data[$scope.currentLocale];
        } else {
            $scope.menuData = [];
            $scope.addToMenu();
        }
    }

    $scope.deleteMenu = function() {
        //show pop-up        
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this menu!",
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
            $scope.selectedMenu.remove().then(function(response) {
                $scope.hideLoader();
                $scope.menuList = _.without($scope.menuList, $scope.selectedMenu);
                $scope.switchMenu(_.first($scope.menuList));
                
                //$scope.refreshMenus();
                var n = noty({text: 'Menu deleted successfully', type:'warning', timeout: 2000});
            }, function() {
                $scope.hideLoader();
                var n = noty({text: "There was an error saving", type:'warning', timeout: 2000});
                console.log("There was an error saving");
            });
            
        });
        //delete

    };

    $scope.saveMenu = function() {
        $scope.saving = true;
        $scope.selectedMenu.data[$scope.currentLocale] = $scope.menuData;
        $scope.selectedMenu.data = $scope.selectedMenu.data;
        $scope.selectedMenu.json = angular.toJson($scope.selectedMenu.data);
        $scope.selectedMenu.save().then(function(response) {
            $scope.saving = false;
        }, function() {
            $scope.saving = false;
            console.log("There was an error saving");
        });
    };
    
    $scope.saving = false;
    $scope.updating = false;
    $scope.updateMenu = function() {
        $scope.updating = true;
        $scope.selectedMenu.save().then(function(response) {
            $scope.updating = false;
        }, function() {
            $scope.updating = false;
            console.log("There was an error saving");
        });
    };

    $scope.getMenus = function() {
        var deferred = $q.defer();
        MenuService.getList().then(function(data) {
            $scope.menuList = data;
            deferred.resolve(data);
        });        
        return deferred.promise;
    }

    $scope.refreshMenus = function() {
        //var n = noty({text: 'Loading...', type:'warning'});
        $scope.getMenus().then(function() {
            //$.noty.closeAll();
        });
    };
    $scope.init = function() {
        //set up locales
        /*_.each($scope.localeChoices, function(locale) { 
            $scope.menuData[locale] = [];
        });*/
        
        //let's get the menus
        $scope.showLoader();
        $scope.getMenus().then(function() {
            $scope.switchMenu(_.first($scope.menuList));
            $scope.hideLoader();
        });
    };

    $scope.init();

});


angular.module('ngAdmin')
.animation('.slide', function() {
    var NG_HIDE_CLASS = 'ng-hide';
    return {
        beforeAddClass: function(element, className, done) {
            if(className === NG_HIDE_CLASS) {
                element.slideUp(done);
            }
        },
        removeClass: function(element, className, done) {
            if(className === NG_HIDE_CLASS) {
                element.hide().slideDown(done);
            }
        }
    }
});
'use strict';

angular.module('ngAdmin')
.controller('NavigationLinksCtrl', function ($scope, $http, ContentService, PropertyService) {

    window.scope = $scope;
    $scope.errors = {};
    $scope.loading = false;
    $scope.linkTypes = [
        {type: 'url', name: 'URL'},
        {type: 'page', name: 'Page'},
        {type: 'property', name: 'Property'}
    ];
    $scope.linkTypeLabel = "test";
    $scope.changeLinkType = function() {
        $scope.setLinkType();
        $scope.selectedPage.selected = {};
        $scope.link.value = {};
    }
    $scope.setLinkType = function() {
        console.log($scope.linkTypeLabel, $scope.link);
        switch ($scope.link.type) {
            case 'page':
                $scope.linkTypeLabel = "Select page";
                if(!angular.isUndefined($scope.link.value)) {
                    $scope.selectedPage.selected = $scope.link.value;
                }
                break;
            case 'property':
                $scope.linkTypeLabel = "Select property";
                if(!angular.isUndefined($scope.link.value)) {
                    $scope.selectedPage.selected = $scope.link.value;
                }
                break;
            case 'url':
                $scope.linkTypeLabel = "Web address";
                break;
        }

    };
    
    $scope.selectedPage = {};
    $scope.pageList = [];
    $scope.updatePageLink = function() {
        console.log('$scope.selectedPage', $scope.selectedPage);
        $scope.link.value = {id : $scope.selectedPage.selected.page_id, title: $scope.selectedPage.selected.title, slug: $scope.selectedPage.selected.slug };
    };
    $scope.spinnerPage = false;
    $scope.searchPages = function($select) {
        if($select.search.length < 1)
            return false;
        $scope.spinnerPage = true;
        return ContentService.getList( {currentLocale: $scope.currentLocale, page: 1, sortField: 'title', sortDirection: 'ASC', search: $select.search}).then(function(pages) {
            $scope.pageList = pages;
            $scope.spinnerPage = false;
        }, function() {
            $scope.spinnerPage = false;
        });
        
    };
    
    
    
    $scope.selectedProperty = {};
    $scope.propertyList = [];
    $scope.updatePropertyLink = function() {
        $scope.link.value = {id : $scope.selectedProperty.selected.property_id, title: $scope.selectedProperty.selected.displayable_address, slug: $scope.selectedProperty.selected.slug };
    };
    $scope.spinnerProperties = false;
    $scope.searchProperties = function($select) {
        if($select.search.length < 1)
            return false;
        $scope.spinnerProperties = true;
        return PropertyService.getList( {currentLocale: $scope.currentLocale, page: 1, sortField: 'displayable_address', sortDirection: 'ASC', search: $select.search}).then(function(properties) {
            $scope.propertyList = properties;
            $scope.spinnerProperties = false;
        }, function() {
            $scope.spinnerProperties = false;
        });
        
    };

    $scope.deleteItem = function() {
		$scope.remove();
		//console.log($scope.$parent.menuData);
	};
	
    $scope.init = function() {
        console.log("partial")
        if(angular.isUndefined($scope.link.type)) {
            $scope.link.type = _.findWhere($scope.linkTypes, {'type': 'page'}).type;
        } else {
            
        }
        
        $scope.setLinkType();
    };

    $scope.init();

});

'use strict';

angular.module('ngAdmin')
  .controller('NavigationEditCtrl', function ($scope) {
	
	$scope.init = function() {

    };
	$scope.init();

});

'use strict';

angular.module('ngAdmin')
  .controller('NavigationCreateCtrl', function ($scope, MenuService) {
    
	window.scope = $scope;
    $scope.errors = {};
    $scope.menu = {};
    $scope.loading = false;
	
    $scope.init = function() {
		
    };
    
    $scope.dismiss = function() {
        $scope.$dismiss();
    };
        
    $scope.slugify = function(input) {
        $scope.menu.handle = S(input).slugify().s;
    };

    
    $scope.submitForm = function(isValid) {
        if(isValid) {
            $scope.loading = true;
            MenuService.post($scope.menu).then(function(response) {
                $scope.loading = false;
                console.log("Object saved OK", response);
                var n = noty({text: 'Success - A new menu was added', type:'warning', timeout: 2000});
                $scope.$close(response);
              }, function(response) {
                $scope.loading = false;
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
    
	$scope.init();

});

'use strict';

angular.module('ngAdmin')
.controller('MembersCtrl', function ($scope, MemberService, $modal, $stateParams) {

    window.scope = $scope;
    $scope.membersList = null;

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.memberType = 'member';
    
    $scope.search = "";
    $scope.sort = {};
    $scope.sort.field = 'created_at';
    $scope.sort.direction = 'desc';
    
    $scope.init = function() {
        console.log("GET MEMBERS RESTFULL");
        console.log('memberId', $stateParams['memberType']);
        
        if(!angular.isUndefined($stateParams['memberType']) && $stateParams['memberType'] != '') {
            $scope.memberType = $stateParams['memberType'];
            
        }

        $scope.pageChanged();
    };


    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
        console.log('$scope.currentPage', $scope.currentPage);
    };

    $scope.performSearch = function() {
        $scope.memberType = 'all';
        $scope.pageChanged();
    };
    
    $scope.pageChanged = function() {
        console.log('Page changed to: ' + $scope.currentPage);

        // This will query /members and return a promise.
        $scope.showLoader();
        MemberService.getList( {memberType: $scope.memberType, page: $scope.currentPage, sortField: $scope.sort.field, sortDirection: $scope.sort.direction, search: $scope.search}).then(function(members) {
            $scope.membersList = members;

            $scope.pageInfo = members.meta;
            $scope.currentPage = members.meta.current_page;
            $scope.totalItems = members.meta.total;
            $scope.hideLoader();
            //$scope.currentPage = members.total;
        });

    };
    
    $scope.addNewMember = function() {

        var modalInstance = $modal.open({
            templateUrl: 'app/members/members-create.html',
            controller: 'MembersCreateCtrl',
            size: 'md'
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.pageChanged();
            console.log("SUCCESS");
        }, function () {
            console.log("CLOSED");
        });

    };
    
    $scope.deleteMember = function(member) {
        //show pop-up        
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this member!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, delete it!',
            closeOnConfirm: false
        },
        function(){
            swal.close();
            var n = noty({text: 'Deleting...', type:'warning', timeout: 2000});
            member.remove().then(function(response) {
                $scope.pageChanged();
                var n = noty({text: 'Deleted', type:'warning', timeout: 2000});
            }, function() {
                var n = noty({text: "There was an error deleting", type:'warning', timeout: 2000});
                console.log("There was an error deleting");
            });
            
        });

    };

    $scope.tableSort = function(field) {
        
        if($scope.sort.direction == 'desc' && $scope.sort.field == field) {
            $scope.sort.direction = 'asc';
        } else if($scope.sort.direction == 'asc' && $scope.sort.field == field) {
            $scope.sort.direction = 'desc';
        } else {
            $scope.sort.direction = 'desc';
        }
        
        $scope.sort.field = field;
        $scope.currentPage = 1;
        $scope.pageChanged();
    };


    $scope.init();

});


angular.module('ngAdmin')
.directive('tableSorter', function () {
    return {
        restrict: 'EA',
        transclude: true,
        scope: {
            info: '=info',
            title: '='
        },
        link: function(scope, element, attrs) {
            scope.selectedField = scope.$parent.sortField;
        },
        templateUrl: 'table-sorter.html'
    };
});

'use strict';

angular.module('ngAdmin')
.controller('MembersEditCtrl', function ($scope, $stateParams, MemberService, $previousState, $state) {

    $previousState.memo("caller");
    window.previousState = $previousState;
    
    $scope.goPrevious = function() { 
        if(!_.isNull(previousState.get())) {
            $previousState.go('caller'); 
        } else {
            $state.go('app.members.list');
        }
    };
    
    $scope.is_admin = true;
    $scope.title = "Editing member";
    window.scopeMember = $scope;
    $scope.member = {};
    $scope.errors = {};
    
    $scope.permissions = ['properties', 'members', 'settings', 'pages', 'navigation', 'languages'];
    $scope.selectedPermissions = ['properties', 'members'];
    
    $scope.toggleSelection = function toggleSelection(permissionName) {
        var idx = $scope.member.admin_permissions.indexOf(permissionName);

        // is currently selected
        if (idx > -1) {
            $scope.member.admin_permissions.splice(idx, 1);
        } else {
            $scope.member.admin_permissions.push(permissionName);
        }
    };
    
    $scope.init = function() {
        console.log('memberId', $stateParams['memberId']);

        $scope.showLoader();
        MemberService.one($stateParams['memberId']).get().then(function(member) {
            $scope.member = member;
            console.log("member", member);
            $scope.hideLoader();
        });

    };	
    
    $scope.submitForm = function(isValid) {
        console.log('memberId', $stateParams['memberId']);
        
        if(isValid) {
            $scope.saving = true;
            $scope.member.save().then(function(response) {
                console.log('response', response);
                var n = noty({text: 'Successfully saved', type:'warning', timeout: 2000});
                $scope.saving = false;
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

                sweetAlert("Oops...", response.data.errors[_.first(_.keys( response.data.errors ))], "error");
                console.log("There was an error saving");
            });
        }

    };
    $scope.init();

});

'use strict';

angular.module('ngAdmin')
  .controller('MembersCreateCtrl', function ($scope, MemberService, $state) {
	window.scope = $scope;
	$scope.member = {};
	
    $scope.title = "Add new member";
	$scope.view = 'agent';
    $scope.errors = {};
	$scope.init = function() {
		
    };
    
    $scope.dismiss = function() {
        $scope.$dismiss();
    };
    
    $scope.submitForm = function(isValid) {
        if(isValid) {
            var n = noty({text: 'Saving...', type:'warning', timeout: 2000});
            MemberService.post($scope.member).then(function(response) {
                console.log("Object saved OK", response);
                if(response.status == 'success') {
                    var n = noty({text: 'Saved', type:'warning', timeout: 2000});
                }
                $scope.$close($scope.member);
              }, function(response) {
                var n = noty({text: "There was an error saving", type:'warning', timeout: 2000});
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
	$scope.init();

});

'use strict';

angular.module('ngAdmin')
  .config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
    .state('app.members', {
      url: '/members',
      abstract: true,
      templateUrl: 'app/viewer.html'
    })  
    .state('app.members.index', {
      url: '/list/:memberType',
      templateUrl: 'app/members/members.html',
      controller: 'MembersCtrl'
    })
    .state('app.members.create', {
      url: '/create',
      templateUrl: 'app/members/members-edit.html',
      controller: 'MembersCreateCtrl'
    })
    .state('app.members.edit', {
      url: '/edit/:memberId',
      templateUrl: 'app/members/members-edit.html',
      controller: 'MembersEditCtrl'
    });
    
});
'use strict';

angular.module('ngAdmin')
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
	  .state('app.languages', {
        url: '/languages',
		abstract: true,
        templateUrl: 'app/viewer.html'
      })  
	  .state('app.languages.index', {
        url: '/index',
        templateUrl: 'app/languages/languages.html',
		controller: 'LanguagesCtrl'
      })
	  .state('app.languages.edit', {
        url: '/edit',
        templateUrl: 'app/languages/languages-edit.html',
        controller: 'LanguagesEditCtrl'
      });

  })
;

'use strict';

angular.module('ngAdmin')
  .controller('LanguagesCtrl', function ($scope) {
  
  $scope.init = function() {

    };
  $scope.init();

});

'use strict';

angular.module('ngAdmin')
  .controller('LanguagesEditCtrl', function ($scope) {
	
	$scope.init = function() {

    };
	$scope.init();

});

// loginModal.js

angular.module('ngAdmin').service('loginModal', function ($modal, $rootScope) {

  function assignCurrentUser (user) {
    $rootScope.currentUser = user;
    return user;
  }

  return function() {
    var instance = $modal.open({
      templateUrl: 'auth/loginModalTemplate.html',
      controller: 'LoginModalCtrl',
      controllerAs: 'LoginModalCtrl'
    })

    return instance.result.then(assignCurrentUser);
  };

});


angular.module('ngAdmin').controller('LoginModalCtrl', function ($scope, UsersApi) {

  this.cancel = $scope.$dismiss;

  this.submit = function (email, password) {
    UsersApi.login(email, password).then(function (user) {
      $scope.$close(user);
    });
  };

});
'use strict';

angular.module('ngAdmin')
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
	  .state('auth', {
        url: '/auth',
        templateUrl: 'app/viewer.html'
      })  
	  .state('auth.login', {
        url: '/login',
        templateUrl: 'app/auth/auth.html',
		    controller: 'AuthCtrl'
      });

    //$urlRouterProvider.otherwise('/');
  })
;

'use strict';

angular.module('ngAdmin')
  .controller('AuthCtrl', function ($scope, $auth, $state) {
    $scope.loginForm = {};
    $scope.setPageClass('auth');

    $scope.init = function() {
      if($scope.user.signedIn) {
        $state.go('app');
      }
    };
    $scope.init();

    $scope.loading = false;
    $scope.submitLogin = function() {

      $scope.loginForm.grant_type = 'password';
      $scope.loginForm.client_id = 1;
      $scope.loginForm.client_secret = 'changeme';
      $scope.invalidLogin = false;
      $scope.loading = true;
        
      $auth.submitLogin($scope.loginForm)
        .then(function(resp) { 
          $state.go('app.properties.index');
          
          // handle success response
          console.log(resp);
          $scope.loading = false;
        })
        .catch(function(resp) { 
          // handle error response
          console.log(resp);
          $scope.invalidLogin = true;
          $scope.loading = false;
        });
    };

});

'use strict';

angular.module('ngAdmin')
  .controller('SidebarCtrl', function ($scope) {
    $scope.date = new Date();
  });

'use strict';

angular.module('ngAdmin')
  .controller('NavbarCtrl', function ($scope) {
    $scope.date = new Date();
  });

'use strict';

angular.module('ngAdmin')
.factory('AuthService', function ($http, Session) {
  var authService = {};
 
  authService.login = function (credentials) {
    return $http
      .post(API_URL + 'auth/sign_in', credentials)
      .then(function (res) {
        Session.create(res.data.id, res.data.user.id,
                       res.data.user.role);
        return res.data.user;
      });
  };
 
  authService.isAuthenticated = function () {
    return !!Session.userId;
  };
 
  authService.isAuthorized = function (authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (authService.isAuthenticated() &&
      authorizedRoles.indexOf(Session.userRole) !== -1);
  };
 
  return authService;
});

angular.module('ngAdmin')
.service('Session', function () {
  this.create = function (sessionId, userId, userRole) {
    this.id = sessionId;
    this.userId = userId;
    this.userRole = userRole;
  };
  this.destroy = function () {
    this.id = null;
    this.userId = null;
    this.userRole = null;
  };
  return this;
});
// Declare factory
angular.module('ngAdmin')
    .factory('PropertyService', function(Restangular, DSCacheFactory) {
		return Restangular.service('property');
});

// Declare factory
angular.module('ngAdmin')
    .factory('MemberService', function(Restangular, DSCacheFactory) {
    return Restangular.service('members');
});

angular.module('ngAdmin')
    .factory('ContentService', function(Restangular, DSCacheFactory) {
    return Restangular.service('content');
});

// Declare factory
angular.module('ngAdmin')
    .factory('MenuService', function(Restangular, DSCacheFactory) {

    return Restangular.service('menu');

});

// Declare factory
angular.module('ngAdmin')
    .factory('LanguageService', function(Restangular, DSCacheFactory) {

    return Restangular.service('language');


});

// Declare factory
angular.module('ngAdmin')
    .factory('PropertyTypeService', function(Restangular, DSCacheFactory) {

    return Restangular.service('property-types');
});

// Declare factory
angular.module('ngAdmin')
    .factory('PackageService', function(Restangular, DSCacheFactory) {

    return Restangular.service('packages');
});

// Declare factory
angular.module('ngAdmin')
    .factory('RegionService', function(Restangular, DSCacheFactory) {
    return Restangular.service('regions');
});

// Declare factory
angular.module('ngAdmin')
    .factory('SearchCriteriaTypeService', function(Restangular, DSCacheFactory) {

    return Restangular.service('search-criteria-types');
});

// Declare factory
angular.module('ngAdmin')
    .factory('PaymentMethodsService', function(Restangular, DSCacheFactory) {

    return Restangular.service('payment-methods');
});
// Declare factory
angular.module('ngAdmin')
    .factory('TransactionService', function(Restangular, DSCacheFactory) {

    return Restangular.service('transactions');
});
// Declare factory
angular.module('ngAdmin')
    .factory('ProspectService', function(Restangular, DSCacheFactory) {

    return Restangular.service('prospects');
});


angular.module('ngAdmin')
    .service('SettingsService', function(Restangular, $q) {

    this.list = {};

    this.save = function(data) {

        var deferred = $q.defer();

        Restangular.all('settings').post(data).then(function() {
            console.log("Object saved OK");
            deferred.resolve(data);

        }, function() {
            deferred.reject(true);
        });
        return deferred.promise;
    }

    this.getList = function(data) {
        var deferred = $q.defer();
        var me = this;

        Restangular.all('settings').getList().then(function(data) {
            console.log("Object saved OK");
            console.log(data);
            console.log(me.list);
            me.list = data;
            deferred.resolve(data);

        }, function() {
            deferred.reject(true);
        });
        return deferred.promise;
    }

    this.getArray = function(data) {
        var deferred = $q.defer();
        var me = this;

        Restangular.all('settings').getList().then(function(response) {

            var settings = {};
            _.each(response, function(n, key) {
                settings[n.key] = n.value;
            });

            deferred.resolve(settings);

        }, function() {
            deferred.reject(true);
        });
        return deferred.promise;
    }

    this.get = function(key) {
        var deferred = $q.defer();
        var me = this;
        console.log(me.list);
        var setting = _.findWhere(me.list, {key: key})
        if(setting) {
            return setting.value;
        }
        return false;
    }


});

'use strict';

angular.module('ngAdmin')
  .controller('MainCtrl', function ($scope, $auth, SettingsService, LanguageService, $rootScope) {

    window.mainScope = $scope;
    $scope.loader = false;
    $scope.loggingOut = false;
    $scope.currentPage = '';
    $scope.currentLocale = 'en';
    $scope.localesList = [];
    $scope.settings = [];

    $scope.setCurrentPage = function(page) {
        $scope.currentPage = page;
    }
    
    $scope.showLoader = function() {
		$scope.loader = true;
    };

    $scope.hideLoader = function() {
		$scope.loader = false;
    };

    $scope.signOut = function() {
        $scope.loggingOut = true;
		$auth.signOut()
        .then(function(resp) { 
          // handle success response
            $scope.loggingOut = false;
        })
        .catch(function(resp) { 
          // handle error response
            $scope.loggingOut = false;
        });
    };

	$scope.menu = [];
    $scope.init = function() {
		$scope.menu = [
			{
			  'title': 'Dashboard',
			  'icon': 'fa-desktop',
			  'type': 'dashboard',
			  'sref': 'app.dashboard.edit'
			}, {
			  'title': 'Properties',
			  'icon': 'fa-building',
			  'type': 'properties',
			  'sref': 'app.properties.edit'
			}, {
			  'type': 'divider'
			}, {
			  'title': 'Members',
			  'icon': 'fa-users',
			  'type': 'members',
			  'sref': 'app.members.edit'
			}, {
			  'title': 'Pages',
			  'icon': 'fa-file-text-o',
			  'type': 'Pages',
			  'sref': 'app.pages.edit'
			}, {
			  'title': 'Navigation',
			  'icon': 'fa-sitemap',
			  'type': 'navigation',
			  'sref': 'app.navigation.edit'
			}, {
			  'title': 'Languages',
			  'icon': 'fa-language',
			  'type': 'language',
			  'sref': 'app.language.edit'
			}, {
			  'type': 'divider'
			}, {
			  'title': 'Transactions',
			  'icon': 'fa-comments-o',
			  'type': 'transactions',
			  'sref': 'app.transactions.edit'
			}, {
			  'title': 'Settings',
			  'icon': 'fa-cogs',
			  'type': 'settings',
			  'sref': 'app.settings.edit'
			}
		];

		//$scope.user.permissions
        $scope.refreshSettings();
        $scope.refreshLocales();

        
    };
    
    $scope.refreshSettings = function() {
        SettingsService.getArray().then(function(settings) {
            $scope.settings = settings;
            $scope.currentLocale = settings.default_locale;
        });
    };
    
    $scope.refreshLocales = function() {
        LanguageService.getList().then(function(data) {
            $scope.localesList = data;
        });
    };
    
	$scope.init();

    /*$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        console.log('$stateChangeStart --- ', event, $('#main-loader'));
	    var section = S(toState.name).between('app.', '.').s;
	    if(!_.contains($scope.user.permissions, section)) {
	    	//event.preventDefault();
	    	console.log(section + " : NOT ALLOWED");
	    }


	  });*/


    $rootScope.$on('$stateChangeSuccess', 
               function(event, toState, toParams, fromState, fromParams){
        $scope.setCurrentPage(toState.name.split('.')[1]);
        
    });
    
  });

angular.module('ngAdmin')
    .directive('serverError', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
            console.log(element, attrs);
            console.log("HEre I am");
            return element.on('change', function() {
                return scope.$apply(function() {
                    return ctrl.$setValidity('server', true);
                });
            });
        }
    };
});

angular.module('ngAdmin')
    .directive('formatPrice', function ($filter) {
        'use strict';

        return {
            require: '?ngModel',
            link: function (scope, elem, attrs, ctrl) {
                if (!ctrl) {
                    return;
                }

                ctrl.$formatters.unshift(function () {
                    return $filter('number')(ctrl.$modelValue);
                });

                ctrl.$parsers.unshift(function (viewValue) {
                    var plainNumber = viewValue.replace(/[\,\.]/g, ''),
                        b = $filter('number')(plainNumber);

                    elem.val(b);

                    return plainNumber;
                });
            }
    };
});

$.noty.defaults = {
        layout      : 'topCenter',
        theme       : 'defaultTheme',
        type        : 'alert',
        text        : '',
        dismissQueue: true,
        template    : '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
        animation   : {
            open: 'animated fadeIn', // Animate.css class names
            close: 'animated fadeOut', // Animate.css class names
            easing: 'swing',
            speed : 500
        },
        timeout     : 2000,
        force       : true,
        modal       : false,
        maxVisible  : 1,
        killer      : true,
        closeWith   : ['click'],
        callback    : {
            onShow      : function() {
            },
            afterShow   : function() {
            },
            onClose     : function() {
            },
            afterClose  : function() {
            },
            onCloseClick: function() {
            }
        },
        buttons     : false
    };

  

$.noty.layouts.topCenter = {
    name     : 'topCenter',
    options  : { // overrides options

    },
    container: {
        object  : '<ul id="noty_topCenter_layout_container" />',
        selector: 'ul#noty_topCenter_layout_container',
        style   : function() {
            $(this).css({
                top          : 50,
                left         : 0,
                position     : 'fixed',
                width        : '310px',
                height       : 'auto',
                margin       : 0,
                padding      : 0,
                listStyleType: 'none',
                zIndex       : 10000000
            });

            $(this).css({
                left: ($(window).width() - $(this).outerWidth(false)) / 2 + 'px'
            });
        }
    },
    parent   : {
        object  : '<li />',
        selector: 'li',
        css     : {}
    },
    css      : {
        display: 'none',
        width  : '310px'
    },
    addClass : ''
};

angular.module("ngAdmin").run(["$templateCache", function($templateCache) {$templateCache.put("app/index.html","<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge,chrome=1\"><title>Please wait...</title><meta name=\"viewport\" content=\"width=device-width\"><style type=\"text/css\">\r\n		@import url(http://fonts.googleapis.com/css?family=Droid+Sans);\r\n\r\n		article, aside, details, figcaption, figure, footer, header, hgroup, nav, section { display: block; }\r\n		audio, canvas, video { display: inline-block; *display: inline; *zoom: 1; }\r\n		audio:not([controls]) { display: none; }\r\n		[hidden] { display: none; }\r\n		html { font-size: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }\r\n		html, button, input, select, textarea { font-family: sans-serif; color: #222; }\r\n		body { margin: 0; font-size: 1em; line-height: 1.4; }\r\n		::-moz-selection { background: #E37B52; color: #fff; text-shadow: none; }\r\n		::selection { background: #E37B52; color: #fff; text-shadow: none; }\r\n		a { color: #00e; }\r\n		a:visited { color: #551a8b; }\r\n		a:hover { color: #06e; }\r\n		a:focus { outline: thin dotted; }\r\n		a:hover, a:active { outline: 0; }\r\n		abbr[title] { border-bottom: 1px dotted; }\r\n		b, strong { font-weight: bold; }\r\n		blockquote { margin: 1em 40px; }\r\n		dfn { font-style: italic; }\r\n		hr { display: block; height: 1px; border: 0; border-top: 1px solid #ccc; margin: 1em 0; padding: 0; }\r\n		ins { background: #ff9; color: #000; text-decoration: none; }\r\n		mark { background: #ff0; color: #000; font-style: italic; font-weight: bold; }\r\n		pre, code, kbd, samp { font-family: monospace, serif; _font-family: \'courier new\', monospace; font-size: 1em; }\r\n		pre { white-space: pre; white-space: pre-wrap; word-wrap: break-word; }\r\n		q { quotes: none; }\r\n		q:before, q:after { content: \"\"; content: none; }\r\n		small { font-size: 85%; }\r\n		sub, sup { font-size: 75%; line-height: 0; position: relative; vertical-align: baseline; }\r\n		sup { top: -0.5em; }\r\n		sub { bottom: -0.25em; }\r\n		ul, ol { margin: 1em 0; padding: 0 0 0 40px; }\r\n		dd { margin: 0 0 0 40px; }\r\n		nav ul, nav ol { list-style: none; list-style-image: none; margin: 0; padding: 0; }\r\n		img { border: 0; -ms-interpolation-mode: bicubic; vertical-align: middle; }\r\n		svg:not(:root) { overflow: hidden; }\r\n		figure { margin: 0; }\r\n		form { margin: 0; }\r\n		fieldset { border: 0; margin: 0; padding: 0; }\r\n		label { cursor: pointer; }\r\n		legend { border: 0; *margin-left: -7px; padding: 0; white-space: normal; }\r\n		button, input, select, textarea { font-size: 100%; margin: 0; vertical-align: baseline; *vertical-align: middle; }\r\n		button, input { line-height: normal; }\r\n		button, input[type=\"button\"], input[type=\"reset\"], input[type=\"submit\"] { cursor: pointer; -webkit-appearance: button; *overflow: visible; }\r\n		button[disabled], input[disabled] { cursor: default; }\r\n		input[type=\"checkbox\"], input[type=\"radio\"] { box-sizing: border-box; padding: 0; *width: 13px; *height: 13px; }\r\n		input[type=\"search\"] { -webkit-appearance: textfield; -moz-box-sizing: content-box; -webkit-box-sizing: content-box; box-sizing: content-box; }\r\n		input[type=\"search\"]::-webkit-search-decoration, input[type=\"search\"]::-webkit-search-cancel-button { -webkit-appearance: none; }\r\n		button::-moz-focus-inner, input::-moz-focus-inner { border: 0; padding: 0; }\r\n		textarea { overflow: auto; vertical-align: top; resize: vertical; }\r\n		input:valid, textarea:valid {  }\r\n		input:invalid, textarea:invalid { background-color: #f0dddd; }\r\n		table { border-collapse: collapse; border-spacing: 0; }\r\n		td { vertical-align: top; }\r\n\r\n		body\r\n		{\r\n			font-family:\'Droid Sans\', sans-serif;\r\n			font-size:10pt;\r\n			color:#555;\r\n			line-height: 25px;\r\n		}\r\n\r\n		.wrapper\r\n		{\r\n			width:760px;\r\n			margin:0 auto 5em auto;\r\n		}\r\n\r\n		.main\r\n		{\r\n			overflow:hidden;\r\n		}\r\n\r\n		.error-spacer\r\n		{\r\n			height:4em;\r\n		}\r\n\r\n		a, a:visited\r\n		{\r\n			color:#2972A3;\r\n		}\r\n\r\n		a:hover\r\n		{\r\n			color:#72ADD4;\r\n		}\r\n	</style></head><body><div class=\"wrapper\"><div class=\"error-spacer\"></div><div role=\"main\" class=\"main\"><h1>Please wait...</h1></div></div></body></html>");
$templateCache.put("app/main.html","<div ng-include=\"\'components/navbar/navbar.html\'\"></div><div id=\"wrapper\" class=\"container-fluid {{currentPage}}-wrapper max-width\"><div id=\"page-content-wrapper\" class=\"{{currentPage}}\"><div ui-view=\"\"></div></div></div><div ng-show=\"loader\" class=\"ui-ios-overlay\"><i class=\"fa fa-circle-o-notch fa-spin\"></i> <span class=\"title\">Loading...</span></div><div ng-show=\"loggingOut\" class=\"ui-ios-overlay logging-out\"><i class=\"fa fa-circle-o-notch fa-spin\"></i> <span class=\"title\">Logging out...</span></div><footer><div class=\"container\"><div class=\"row\"><div class=\"col-sm-8 col-sm-offset-2 text-center\"><p class=\"logo-text\">estatezilla</p></div></div><div class=\"row\"><div class=\"col-sm-8 col-sm-offset-2 text-center\"><p>Code licensed under <a href=\"\">GNU General Public Licence</a>.</p></div></div></div></footer>");
$templateCache.put("app/viewer.html","<div ui-view=\"\"></div>");
$templateCache.put("components/editable-table.html","<table class=\"table\"><thead><tr><th></th><th>Search criteria type</th></tr></thead><tbody><tr ng-repeat-start=\"(key, row) in list | orderBy:\'position\':reverse\"><td><a href=\"\" style=\"margin-right: 2px;\" ng-click=\"moveSearchCriteriaType(key, \'up\')\"><i class=\"fa fa-arrow-up\"></i></a><a href=\"\" ng-click=\"moveSearchCriteriaType(key, \'down\')\"><i class=\"fa fa-arrow-down\"></i></a></td><td><a href=\"#\"><strong>{{row.name}}</strong></a></td><td><a href=\"#\">Edit</a> | <a href=\"#\">Delete</a></td></tr><tr ng-repeat-end=\"(key, row) in list | orderBy:\'position\':reverse\"><td><a href=\"\" style=\"margin-right: 2px;\" ng-click=\"moveSearchCriteriaType(rowKey, \'up\')\"><i class=\"fa fa-arrow-up\"></i></a><a href=\"\" ng-click=\"moveSearchCriteriaType(rowKey, \'down\')\"><i class=\"fa fa-arrow-down\"></i></a></td><td><input type=\"text\" ng-model=\"row.name\" class=\"form-control\"></td><td ng-hide=\"searchCriteriaTypeUpdating\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"updatePropertyType(propertyType, propertyTypeCopy)\">Update</button> | <a href=\"\" ng-click=\"cancelEditPropertyType(propertyType.id)\">Cancel</a></td><td ng-show=\"searchCriteriaTypeUpdating\"><button type=\"button\" class=\"btn btn-default\"><i class=\"fa fa-refresh fa-spin\"></i> Updating</button></td></tr></tbody></table>");
$templateCache.put("app/auth/auth.html","<div class=\"container\" style=\"margin-top:5%\"><div class=\"col-md-6 col-md-offset-3\"><div class=\"row\"><div class=\"col-md-10 col-md-offset-1\"><div class=\"panel member_signin\"><div class=\"panel-body\"><div class=\"fa_user\"><i class=\"fa fa-lock\"></i></div><p class=\"member\">estatezilla</p><form role=\"form\" class=\"loginform\" ng-submit=\"submitLogin(loginForm)\" ng-init=\"loginForm = {}\"><div class=\"alert alert-danger\" role=\"alert\" ng-show=\"invalidLogin\"><strong>Error:</strong> Invalid login</div><div class=\"form-group\"><label class=\"sr-only\">Username/email</label><div class=\"input-group\"><input type=\"text\" class=\"form-control input-lg\" ng-model=\"loginForm.username\" placeholder=\"Username\"></div></div><div class=\"form-group\"><label class=\"sr-only\">Password</label><div class=\"input-group\"><input type=\"password\" class=\"form-control input-lg\" ng-model=\"loginForm.password\" placeholder=\"Password\"></div></div><button type=\"submit\" class=\"btn btn-primary btn-lg login\" ng-hide=\"loading\">LOG IN <i class=\"fa fa-chevron-right\"></i></button> <button type=\"submit\" class=\"btn btn-primary btn-lg login\" ng-show=\"loading\"><i class=\"fa fa-refresh fa-spin\"></i> Logging in...</button><br><br><br><div class=\"row\"><div class=\"col-md-6\"><div class=\"login-help\"><a href=\"../password/email\">Forgot Password?</a></div></div><div class=\"col-md-6\"><div class=\"login-help\"><a href=\"../auth/register\">Create an account</a></div></div></div><br><br><div class=\"row\"><div class=\"col-md-12 text-center\"><p class=\"muted\">Please use a valid username and password to login to the administrator backend</p></div></div></form></div></div></div></div></div></div>");
$templateCache.put("app/auth/loginModalTemplate.html","<div><form ng-submit=\"LoginModalCtrl.submit(_email, _password)\"><input type=\"email\" ng-model=\"_email\"> <input type=\"password\" ng-model=\"_password\"> <button>Submit</button></form><button ng-click=\"LoginModalCtrl.cancel()\">Cancel</button></div>");
$templateCache.put("app/languages/languages-edit.html","<div class=\"container-fluid no-padding\"><div class=\"container-fluid main-content\"><div class=\"row\"><div class=\"col-md-8\"><br><h3>Edit property</h3><hr><br><div class=\"panels panel-default\"><div class=\"panels-body\"><form><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label for=\"exampleInputEmail1\">Name</label> <input type=\"email\" class=\"form-control\" id=\"exampleInputEmail1\" placeholder=\"Enter email\"></div></div></div><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label for=\"exampleInputPassword1\">Homepage title</label> <input type=\"email\" class=\"form-control\" id=\"exampleInputEmail1\" placeholder=\"Enter email\"></div></div></div><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label for=\"exampleInputEmail1\">Homepage meta description</label> <textarea class=\"form-control\">\n    </textarea></div></div></div><div class=\"row\"><div class=\"col-md-6\"><div class=\"form-group\"><label for=\"exampleInputPassword1\">Account email</label> <input type=\"password\" class=\"form-control\" id=\"exampleInputPassword1\" placeholder=\"Password\"></div></div><div class=\"col-md-6\"><div class=\"form-group\"><label for=\"exampleInputPassword1\">Customer email</label> <input type=\"password\" class=\"form-control\" id=\"exampleInputPassword1\" placeholder=\"Password\"></div></div></div></form></div></div><br><br><button type=\"submit\" class=\"btn btn-primary\">Save property</button><br></div><div class=\"col-md-3 pull-right\"><div class=\"row\"><div class=\"col-md-12\"><br><br><br><br><br><div class=\"panel panel-default\" style=\"margin-top: 15px\"><div class=\"panel-heading\">Property types</div><div class=\"panel-body\"><p>Blog posts are a great promotion tool that can be used to write about new products and deals.</p><br><table class=\"table\"><tbody><tr style=\"border-top: none\"><td><a href=\"#\"><strong>Detached house</strong></a></td><td><a href=\"#\">Edit</a> | <a href=\"#\">Delete</a></td></tr><tr><td><a href=\"#\"><strong>General</strong></a></td><td><a href=\"#\">Edit</a> | <a href=\"#\">Delete</a></td></tr></tbody></table></div></div><div class=\"panel panel-default\"><div class=\"panel-heading\">New property type</div><div class=\"panel-body\"><p>Add new property type</p><input type=\"text\" class=\"form-control\"><br><button type=\"submit\" class=\"btn btn-primary\">Add</button><br></div></div></div></div></div></div><br><br></div></div>");
$templateCache.put("app/languages/languages.html","<div class=\"container-fluid no-padding\"><div class=\"container-fluid main-content\"><div class=\"row\"><div class=\"col-md-8\"><br><h3>Languages</h3><hr><br><br><div class=\"row\"><div class=\"col-md-6\"><div class=\"well\"><h4>English</h4><p>Import your .po file here</p><div class=\"form-group\"><label for=\"exampleInputFile\">File input</label> <input type=\"file\" id=\"exampleInputFile\"></div><hr><p>Export your .po file</p><button type=\"button\" class=\"btn btn-default\">Export</button></div></div><div class=\"col-md-6\"><div class=\"well\"><h4>English</h4><p>Import your .po file here</p><div class=\"form-group\"><label for=\"exampleInputFile\">File input</label> <input type=\"file\" id=\"exampleInputFile\"></div><hr><p>Export your .po file</p><button type=\"button\" class=\"btn btn-default\">Export</button></div></div><div class=\"col-md-6\"><div class=\"well\"><h4>English</h4><p>Import your .po file here</p><div class=\"form-group\"><label for=\"exampleInputFile\">File input</label> <input type=\"file\" id=\"exampleInputFile\"></div><hr><p>Export your .po file</p><button type=\"button\" class=\"btn btn-default\">Export</button></div></div></div><br><br><br><br><h4 class=\"text-underline\">Translation completion</h4><br><table class=\"table\"><thead><tr><th>Language</th><th>Status</th></tr></thead><tbody><tr><td><a href=\"#\">English <span class=\"muted\">(Default language)</span></a></td><td><a href=\"#\">100% complete</a></td></tr><tr><td><a href=\"#\">French</a></td><td><a href=\"#\">70% complete</a></td></tr></tbody></table><br><br></div><div class=\"col-md-3 pull-right\"><br><br><br><br><h4>Default language</h4><p>Edit your store information. The store name shows up on your storefront, while the title and meta description help define how your store shows up on search engines.</p></div></div><br><br></div></div>");
$templateCache.put("app/members/members-create.html","<form name=\"form\" ng-submit=\"submitForm(form.$valid)\" novalidate=\"\" qn:validate=\"errors\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" ng-click=\"dismiss()\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button><h4 class=\"modal-title\">Adding new member</h4></div><div class=\"modal-body\"><div class=\"row\"><div class=\"col-md-3\"><div class=\"form-group\"><label>Salutation</label><select ng-model=\"member.gender\" class=\"form-control\"><option value=\"male\">Mr</option><option value=\"female\">Mrs</option></select></div></div><div class=\"col-md-4\"><div class=\"form-group\"><label>First name</label> <input type=\"text\" name=\"firstname\" ng-model=\"member.firstname\" class=\"form-control\" required=\"\"><div ng-messages=\"form.firstname.$error\" ng-if=\"form.$submitted\" ng-messages-include=\"my-messages\"></div></div></div><div class=\"col-md-5\"><div class=\"form-group\"><label>Last name</label> <input type=\"text\" name=\"lastname\" ng-model=\"member.lastname\" class=\"form-control\" required=\"\"><div ng-messages=\"form.lastname.$error\" ng-if=\"form.$submitted\" ng-messages-include=\"my-messages\"></div></div></div></div><div class=\"row\"><div class=\"col-md-6\"><div class=\"form-group\"><label>Email address</label> <input type=\"email\" name=\"email\" ng-model=\"member.email\" class=\"form-control\" ng-required=\"true\" ng-pattern=\"/^[_a-z0-9-]+(\\.[_a-z0-9-]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,15})$/\" server-error=\"\"><div ng-messages=\"form.email.$error\" ng-if=\"form.$submitted\" ng-messages-include=\"my-messages\"><p ng-message=\"server\" class=\"help-block\">{{ errors.email }}</p></div></div></div><div class=\"col-md-6\"><div class=\"form-group\"><label>Phone (optional)</label> <input type=\"text\" ng-model=\"member.phone\" class=\"form-control\"></div></div></div><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label>Notes (optional)</label> <textarea class=\"form-control\" ng-model=\"member.about\"></textarea></div></div></div><hr><div class=\"row\"><div class=\"col-md-6\"><div class=\"form-group\"><label>Username</label> <input type=\"text\" ng-model=\"member.username\" class=\"form-control\" name=\"username\" server-error=\"\"><p ng-show=\"form.username.$invalid && form.$submitted\" class=\"help-block\">{{ errors.username }}</p></div></div></div><div class=\"row\"><div class=\"col-md-6\"><div class=\"form-group\"><label>Password</label> <input type=\"password\" name=\"password\" ng-model=\"member.password\" class=\"form-control\" server-error=\"\"><p ng-show=\"form.password.$error.server && form.$submitted\" class=\"help-block\">{{ errors.password }}</p></div></div><div class=\"col-md-6\"><div class=\"form-group\"><label>Confirm password</label> <input type=\"password\" name=\"password_confirmation\" ng-model=\"member.password_confirmation\" class=\"form-control\" ng-match=\"member.password\" server-error=\"\"><p ng-show=\"form.password_confirmation.$error.match && form.$submitted\" class=\"help-block\">Passwords must match</p><p ng-show=\"form.password_confirmation.$error.server && form.$submitted\" class=\"help-block\">{{ errors.password_confirmation }}</p></div></div></div><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><div class=\"checkbox\"><label><input type=\"checkbox\" ng-model=\"member.is_advertiser\"> Member is an estate agent/advertiser</label></div><div class=\"checkbox\"><label><input type=\"checkbox\" ng-model=\"member.is_seller\"> Member is a non-professional seller/landlord</label></div><div class=\"checkbox\"><label><input type=\"checkbox\" ng-model=\"member.is_prospect\"> Member is a prospective buyer</label></div></div></div></div></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"dismiss()\">Close</button> <button type=\"submit\" class=\"btn btn-primary\">Save member</button></div></form><script type=\"text/ng-template\" id=\"my-messages\"><p ng-message=\"required\" class=\"help-block\">This field is required</p> <p ng-message=\"minlength\" class=\"help-block\">Input too short</p> <p ng-message=\"email\" class=\"help-block\">This field must be an email</p></script>");
$templateCache.put("app/members/members-edit.html","<form name=\"form\" ng-submit=\"submitForm(form.$valid)\" novalidate=\"\" qn:validate=\"errors\"><div class=\"container-fluid no-padding\"><div class=\"container-fluid main-content\"><br><br><a ng-show=\"member.is_admin == false\" ui-sref=\"app.members.index({ memberType: \'member\' })\"><i class=\"fa fa-chevron-left\"></i> Back to members list</a> <a ng-show=\"member.is_admin == true\" ui-sref=\"app.settings.admins\"><i class=\"fa fa-chevron-left\"></i> Back to list of admins</a><div class=\"row\"><div class=\"col-md-6\"><h3>Editing : \"{{member.email}}\"</h3><hr><br><div ng-include=\"\'app/members/blocks/edit-member.html\'\"></div></div><div class=\"col-md-6\"><br><br><br><br><div class=\"row\"><div class=\"col-md-10 pull-right\"><div class=\"well\"><div ng-include=\"\'app/members/blocks/member-roles.html\'\"></div><div class=\"panel panel-default\" ng-show=\"member.is_admin\"><div class=\"panel-heading\">Admin access</div><div class=\"panel-body\"><div ng-include=\"\'app/members/blocks/admin-access.html\'\"></div></div></div><div class=\"panel panel-default\" ng-hide=\"member.is_admin\"><div class=\"panel-heading\">Member Remarks</div><div class=\"panel-body\"><div ng-include=\"\'app/members/blocks/member-remarks.html\'\"></div></div></div></div></div></div></div></div><br><br><div class=\"row\"><div class=\"col-md-12\"><div class=\"panel panel-default\"><div class=\"panel-body\"><button type=\"submit\" ng-hide=\"saving\" class=\"btn btn-primary pull-right\">Save member</button> <button type=\"button\" ng-show=\"saving\" class=\"btn btn-primary pull-right\">Saving...</button></div></div></div></div></div></div></form><script type=\"text/ng-template\" id=\"my-messages\"><p ng-message=\"required\" class=\"help-block\">This field is required</p> <p ng-message=\"minlength\" class=\"help-block\">Input too short</p> <p ng-message=\"email\" class=\"help-block\">This field must be an email</p></script>");
$templateCache.put("app/members/members.html","<div class=\"container-fluid no-padding\"><div class=\"container-fluid main-content\"><div class=\"row\"><div class=\"col-md-12\"><br><div class=\"row\"><div class=\"col-md-8\"><h3>Members</h3></div><div class=\"col-md-4\"><br><form class=\"form-inline pull-right\" ng-submit=\"performSearch()\"><div class=\"form-group\"><div class=\"left-inner-addon\"><i class=\"fa fa-search\"></i> <input type=\"text\" class=\"form-control\" ng-model=\"search\" placeholder=\"Search for a user\"></div></div><button type=\"submit\" class=\"btn btn-default\">Search</button></form></div></div><br><br><ul class=\"nav nav-tabs\"><li ng-class=\"{active: memberType == \'member\'}\"><a ui-sref=\"app.members.index({ memberType: \'member\' })\" data-toggle=\"tab\">All members</a></li><li ng-class=\"{active: memberType == \'advertiser\'}\"><a ui-sref=\"app.members.index({ memberType: \'advertiser\' })\" data-toggle=\"tab\">Estate agents</a></li><li ng-class=\"{active: memberType == \'seller\'}\"><a ui-sref=\"app.members.index({ memberType: \'seller\' })\" data-toggle=\"tab\">Sellers/Landlords</a></li><li ng-class=\"{active: memberType == \'prospect\'}\"><a ui-sref=\"app.members.index({ memberType: \'prospect\' })\" data-toggle=\"tab\">Registered prospects</a></li><li class=\"pull-right\" ng-class=\"{active: memberType == \'unregistered_prospect\'}\"><a ui-sref=\"app.prospects.index({ memberType: \'prospect\' })\" data-toggle=\"tab\">Unregistered prospects</a></li></ul><div class=\"blank-slate\" ng-show=\"membersList != null && membersList.length == 0\"><br><br><i class=\"fa fa-users\"></i><h2>Sorry, no members found</h2></div><div ng-show=\"membersList != null && membersList.length > 0\"><div class=\"row\" style=\"margin-top: 20px; margin-bottom: 20px;\"><div class=\"col-md-8\"><form class=\"form-inline pull-left\"><div class=\"form-group\"><a class=\"btn btn-default btn-new\" ng-click=\"addNewMember()\"><i class=\"fa fa-plus\"></i> Add a new member</a></div></form></div><div class=\"col-md-4\"><div class=\"pull-right\" style=\"margin-top: 0px;\"><pagination style=\"margin-top: 0px; margin-bottom: 0;\" total-items=\"totalItems\" ng-model=\"currentPage\" max-size=\"maxSize\" class=\"pagination-sm\" boundary-links=\"false\" rotate=\"true\" num-pages=\"numPages\" ng-change=\"pageChanged()\"></pagination></div></div></div><table class=\"table table-striped table-bordered\"><thead><tr><th class=\"sorter\" ng-click=\"tableSort(\'username\')\" table-sorter=\"\" info=\"{ name: \'email\', sort: sort }\">Email</th><th class=\"sorter\" ng-click=\"tableSort(\'name\')\" table-sorter=\"\" info=\"{ name: \'name\', sort: sort }\">Name</th><th class=\"sorter\" ng-click=\"tableSort(\'email\')\" table-sorter=\"\" info=\"{ name: \'username\', sort: sort }\">Username</th><th ng-if=\"company_name == \'advertiser\'\" class=\"sorter\" ng-click=\"tableSort(\'company_name\')\" table-sorter=\"\" info=\"{ name: \'company_name\', sort: sort }\">Company</th><th class=\"sorter\" ng-click=\"tableSort(\'created_at\')\" table-sorter=\"\" info=\"{ name: \'role\', sort: sort }\">Date registered</th></tr></thead><tbody><tr ng-repeat=\"member in membersList\"><td><div class=\"row\"><div class=\"col-md-12\"><div style=\"padding-left: 5px;\"><a href=\"\" ui-sref=\"app.members.edit({memberId: member.id})\"><strong>{{member.email}}</strong></a> <a ng-click=\"deleteMember(member)\" class=\"delete-link muted\" href=\"\"><small>(Delete)</small></a></div></div></div></td><td>{{member.firstname}} {{member.lastname}}</td><td><a href=\"\" ui-sref=\"app.members.edit({memberId: member.id})\">{{member.username}}</a></td><td ng-if=\"company_name == \'advertiser\'\">{{member.company_name}}</td><td>{{member.registered_at}}</td></tr></tbody></table><br><div class=\"pagination-text\">Showing {{pageInfo.from}} - {{pageInfo.to}} <small>of {{pageInfo.total}}</small></div><nav class=\"disabled\"></nav></div></div><div class=\"col-md-3\" ng-if=\"false\"><div class=\"row\"><div class=\"col-md-10 col-md-offset-1\"><br><br><div class=\"well\"><h4>Membership information</h4><p><strong>Registered members</strong> are users that have registered on your website and are actively looking for properties.</p><br><p><strong>Prospective buyers</strong> are users that have made in interest in a property or list of properties on your site without registering.</p><br><p>You can also add a new member manually.</p><a class=\"btn btn-primary\" ng-click=\"addNewMember()\">Add a new member</a></div></div></div></div></div><br><br></div></div><script type=\"text/ng-template\" id=\"table-sorter.html\"><span ng-transclude></span> <a href=\"\" class=\"\" ng-show=\"info.sort.field != info.name\"></a> <a href=\"\" class=\"asc\" ng-show=\"info.sort.direction == \'asc\' && info.sort.field == info.name\"><i class=\"fa fa-sort-asc\"></i></a> <a href=\"\" class=\"desc\" ng-show=\"info.sort.direction == \'desc\' && info.sort.field == info.name\"><i class=\"fa fa-sort-desc\"></i></a></script>");
$templateCache.put("app/navigation/navigation-create.html","<form name=\"form\" ng-submit=\"submitForm(form.$valid)\" novalidate=\"\" qn:validate=\"errors\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" ng-click=\"dismiss()\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button><h4 class=\"modal-title\">Adding new menu</h4></div><div class=\"modal-body\"><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\" ng-class=\"{\'has-error has-feedback\': (form.name.$invalid && form.$submitted)}\"><label>Menu name</label> <input type=\"text\" name=\"name\" ng-model=\"menu.name\" class=\"form-control\" ng-change=\"slugify(menu.name)\" server-error=\"\" ng-required=\"\"> <span ng-show=\"form.name.$invalid && form.$submitted\" class=\"glyphicon glyphicon-remove form-control-feedback\" aria-hidden=\"true\"></span><div class=\"help-block\" ng-messages=\"form.name.$error\" ng-if=\"form.$submitted\" ng-messages-include=\"my-messages\"><p ng-message=\"server\" class=\"help-block\">{{ errors.name }}</p></div></div></div><div class=\"col-md-12\"><div class=\"form-group\" ng-class=\"{\'has-error has-feedback\': (form.handle.$invalid && form.$submitted)}\"><label>Handle</label> <input type=\"text\" name=\"handle\" ng-model=\"menu.handle\" class=\"form-control\" ng-required=\"\" server-error=\"\"> <span ng-show=\"form.handle.$invalid && form.$submitted\" class=\"glyphicon glyphicon-remove form-control-feedback\" aria-hidden=\"true\"></span><div class=\"help-block\" ng-messages=\"form.handle.$error\" ng-if=\"form.$submitted\" ng-messages-include=\"my-messages\"><p ng-message=\"server\" class=\"help-block\">{{ errors.handle }}</p></div></div></div></div></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"dismiss()\">Close</button> <button type=\"button\" class=\"btn btn-primary\" ng-show=\"loading\">Please wait...</button> <button type=\"submit\" class=\"btn btn-primary\" ng-hide=\"loading\">Create menu</button></div></form><script type=\"text/ng-template\" id=\"my-messages\"><p ng-message=\"required\" class=\"help-block\">This field is required</p> <p ng-message=\"minlength\" class=\"help-block\">Input too short</p> <p ng-message=\"email\" class=\"help-block\">This field must be an email</p></script>");
$templateCache.put("app/navigation/navigation-links.partial.html","<div ui-tree-handle=\"\" class=\"panel panel-default tree-node tree-node-content\" ng-controller=\"NavigationLinksCtrl\"><div class=\"panel-heading\" ng-class=\"{active: !isCollapsed}\">{{link.title}} <a href=\"\" class=\"pull-right\" nodrag=\"\" ng-click=\"isCollapsed = !isCollapsed\">Edit</a></div><div class=\"panel-body\" nodrag=\"\" ng-show=\"isCollapsed\"><form name=\"form\" ng-submit=\"submitForm(form.$valid)\" novalidate=\"\" qn:validate=\"errors\"><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label>Link name</label> <input type=\"text\" name=\"title\" ng-model=\"link.title\" class=\"form-control\" required=\"\"><div ng-messages=\"form.title.$error\" ng-if=\"form.$submitted\" ng-messages-include=\"my-messages\"></div></div></div><div class=\"col-md-6\"><div class=\"form-group\"><label>Links to</label><select class=\"form-control\" ng-model=\"link.type\" ng-options=\"linkType.type as linkType.name for linkType in linkTypes\" ng-change=\"changeLinkType()\"></select><div ng-messages=\"form.lastname.$error\" ng-if=\"form.$submitted\" ng-messages-include=\"my-messages\"></div></div></div><div class=\"col-md-6\"><div class=\"form-group\" ng-show=\"link.type == \'url\'\"><label>{{linkTypeLabel}}</label> <input type=\"text\" name=\"value\" ng-model=\"link.value.url\" class=\"form-control\" required=\"\"><div ng-messages=\"form.value.$error\" ng-if=\"form.$submitted\" ng-messages-include=\"my-messages\"></div></div><div class=\"form-group\" ng-show=\"link.type == \'page\'\"><label>{{linkTypeLabel}}</label> <span ng-show=\"spinnerPage\" class=\"pull-right\" style=\"margin-right: 5px;\"><i class=\"fa fa-refresh fa-spin\"></i></span><ui-select ng-model=\"selectedPage.selected\" theme=\"bootstrap\" ng-change=\"updatePageLink()\"><ui-select-match placeholder=\"Search for a page\">{{$select.selected.title}}</ui-select-match><ui-select-choices refresh=\"searchPages($select)\" refresh-delay=\"300\" repeat=\"page in pageList\"><span ng-bind-html=\"page.title | highlight: $select.search\"></span></ui-select-choices></ui-select></div><div class=\"form-group\" ng-show=\"link.type == \'property\'\"><label>{{linkTypeLabel}}</label> <span ng-show=\"spinnerProperties\" class=\"pull-right\" style=\"margin-right: 5px;\"><i class=\"fa fa-refresh fa-spin\"></i></span><ui-select ng-model=\"selectedProperty.selected\" theme=\"bootstrap\" ng-change=\"updatePropertyLink()\"><ui-select-match placeholder=\"Search for a property\">{{$select.selected.displayable_address}}</ui-select-match><ui-select-choices refresh=\"searchProperties($select)\" refresh-delay=\"300\" repeat=\"property in propertyList\"><span ng-bind-html=\"property.displayable_address | highlight: $select.search\"></span></ui-select-choices></ui-select></div></div><div class=\"col-md-12\"><a class=\"muted delete-link\" href=\"\" ng-click=\"deleteItem()\"><i class=\"fa fa-times\"></i> Delete</a></div></div></form></div></div><ol ui-tree-nodes=\"\" ng-model=\"link.nodes\" ng-class=\"{hidden: collapsed}\"><li ng-repeat=\"link in link.nodes\" ui-tree-node=\"\" ng-include=\"\'app/navigation/navigation-links.partial.html\'\"></li></ol>");
$templateCache.put("app/navigation/navigation.html","<div class=\"container-fluid no-padding navigation-tree\"><div class=\"container-fluid main-content\"><div class=\"row\"><div class=\"col-md-12\"><br><div class=\"row\"><div class=\"col-md-1\" style=\"width: auto\"><h3>Navigation</h3></div><div class=\"col-md-3\"></div></div><div class=\"row\" style=\"margin-top: 20px; margin-bottom: 0px;\"><div class=\"col-md-12\"><ul id=\"myTab\" class=\"nav nav-tabs\" role=\"tablist\"><li role=\"presentation\" ng-repeat=\"menu in menuList\" ng-class=\"{active: menu.handle == selectedMenu.handle}\"><a href=\"\" ng-click=\"switchMenu(menu)\" role=\"tab\" data-toggle=\"tab\" aria-controls=\"home\" aria-expanded=\"true\">{{menu.name}}</a></li><li role=\"presentation\"><a href=\"\" ng-click=\"addNewMenu()\" role=\"tab\" id=\"profile-tab\" data-toggle=\"tab\" aria-controls=\"profile\"><i class=\"fa fa-plus\"></i></a></li></ul></div></div><div class=\"row slide\" style=\"margin-top: 20px; margin-bottom: 20px;\" ng-show=\"showAdditional\"><div class=\"col-md-12\"><form name=\"form\" class=\"form-inline\" ng-submit=\"updateMenu(form.$valid)\" novalidate=\"\" qn:validate=\"errors\"><div class=\"form-group\"><p class=\"form-control-static\" style=\"float: left; margin-right: 5px\">Menu name</p><input type=\"text\" class=\"form-control\" ng-model=\"selectedMenu.name\"></div><div class=\"form-group\"><p class=\"form-control-static\" style=\"float: left; margin-left: 10px; margin-right: 5px\">Handle</p><input type=\"text\" class=\"form-control\" ng-model=\"selectedMenu.handle\"> <button type=\"button\" class=\"btn btn-default\" ng-show=\"updating\">Updating...</button> <button type=\"submit\" class=\"btn btn-default\" ng-hide=\"updating\">Update</button></div><div class=\"form-group\" style=\"padding-right: 10px; padding-left: 10px;\">|</div><div class=\"form-group\"><p class=\"form-control-static\" style=\"float: left; margin-right: 5px\"><a href=\"\" ng-click=\"deleteMenu(selectedMenu)\" class=\"muted delete-link no-underline\"><i class=\"fa fa-times\"></i> Delete menu</a></p></div></form></div></div><div class=\"row\" ng-hide=\"showAdditional\" style=\"margin-bottom: 20px;\"><div class=\"col-md-12\"><div class=\"btn-additional pull-right\"><a href=\"\" ng-click=\"showAdditional = !showAdditional\"><i class=\"fa fa-angle-double-down\"></i> Additional options</a></div></div></div><hr ng-show=\"showAdditional\" style=\"margin-bottom: 0px;\"><div class=\"row\" ng-show=\"showAdditional\" style=\"margin-bottom: 20px;\"><div class=\"col-md-12\"><div class=\"btn-additional pull-right\"><a href=\"\" ng-click=\"showAdditional = !showAdditional\"><i class=\"fa fa-angle-double-up\"></i> Hide options</a></div></div></div><div class=\"row\"><div class=\"col-md-8\"><div ui-tree=\"\" id=\"tree-root\"><ol ui-tree-nodes=\"\" ng-model=\"menuData\"><li ng-repeat=\"link in menuData\" ui-tree-node=\"\" ng-include=\"\'app/navigation/navigation-links.partial.html\'\"></li></ol></div><div class=\"row\" style=\"margin-top: 10px;\"><div class=\"col-md-12\"><a href=\"\" class=\"add-item\" ng-click=\"addToMenu()\"><i class=\"fa fa-plus-circle\"></i> Add menu item</a></div></div></div><div class=\"col-md-4\"><div class=\"row\"><div class=\"col-md-11 pull-right\"><div class=\"panel panel-default\"><div class=\"panel-heading\">Settings</div><div class=\"panel-body\"><div class=\"form-group\"><label>Change locale</label><select name=\"action\" class=\"form-control\" ng-model=\"currentLocale\" ng-change=\"changeLanguage()\"><option ng-repeat=\"localeChoice in localesList\" value=\"{{localeChoice.code}}\">{{localeChoice.name}}</option></select></div></div><div class=\"panel-footer\"><button type=\"button\" class=\"btn btn-primary\" ng-show=\"saving\">Saving...</button> <button type=\"button\" ng-click=\"saveMenu()\" class=\"btn btn-primary\" ng-hide=\"saving\">Save menu</button></div></div></div></div></div></div></div><br></div></div><br><br></div>");
$templateCache.put("app/properties/properties.html","<div ui-view=\"\"></div><div class=\"container-fluid\"><div class=\"properties-wrapper\"><div class=\"row\"><div ui-view=\"list\" class=\"col-sm-4 col-xs-12 col-sm-12 listings-bar\" ng-hide=\"displayEditor && isMobile\"></div><div class=\"col-sm-8 col-xs-12 listings-wrapper\" ng-show=\"displayEditor\"><div ui-view=\"editor\"></div></div></div></div></div>");
$templateCache.put("app/properties/property-create.html","<form name=\"form\" ng-submit=\"submitForm(form.$valid)\" novalidate=\"\" qn:validate=\"errors\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" ng-click=\"dismiss()\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button><h4 class=\"modal-title\">Listing type</h4></div><div class=\"modal-body\"><div class=\"row\"><div class=\"col-xs-12\"><div class=\"form-group\" ng-class=\"{\'has-error has-feedback\': (form.property_title.$invalid && form.$submitted)}\"><label>Property title</label> <input type=\"text\" class=\"form-control\" ng-model=\"property.title\" name=\"property_title\" placeholder=\"\" required=\"\"> <span ng-show=\"form.property_title.$invalid && form.$submitted\" class=\"glyphicon glyphicon-remove form-control-feedback\" aria-hidden=\"true\"></span><div class=\"help-block\" ng-messages=\"form.property_title.$error\" ng-if=\"form.$submitted\" ng-messages-include=\"my-messages\"><p ng-message=\"server\" class=\"help-block\">{{ errors.handle }}</p></div></div></div><div class=\"col-xs-6\"><div class=\"form-group\" ng-class=\"{\'has-error has-feedback\': (form.handle.$invalid && form.$submitted)}\"><label>Listing status</label><br><p class=\"form-control-static\"><label class=\"radio-inline\"><input type=\"radio\" name=\"listing_status\" value=\"sale\" ng-model=\"property.listing_status\"> Sale</label> <label class=\"radio-inline\"><input type=\"radio\" name=\"listing_status\" value=\"rent\" ng-model=\"property.listing_status\"> Rent</label></p><span ng-show=\"form.listing_status.$invalid && form.$submitted\" class=\"glyphicon glyphicon-remove form-control-feedback\" aria-hidden=\"true\"></span><div class=\"help-block\" ng-messages=\"form.listing_status.$error\" ng-if=\"form.$submitted\" ng-messages-include=\"my-messages\"><p ng-message=\"server\" class=\"help-block\">{{ errors.handle }}</p></div></div></div><div class=\"col-xs-6\"><div class=\"form-group\" ng-class=\"{\'has-error has-feedback\': (form.property_type_id.$invalid && form.$submitted)}\"><label>Property type</label><select class=\"form-control\" name=\"property_type_id\" ng-model=\"property.property_type_id\" ng-options=\"propertyType.id as propertyType.name for propertyType in propertyTypes\"><option value=\"\">-- SELECT --</option></select><span ng-show=\"form.property_type_id.$invalid && form.$submitted\" class=\"glyphicon glyphicon-remove form-control-feedback\" aria-hidden=\"true\"></span><div class=\"help-block\" ng-messages=\"form.property_type_id.$error\" ng-if=\"form.$submitted\" ng-messages-include=\"my-messages\"><p ng-message=\"server\" class=\"help-block\">{{ errors.handle }}</p></div></div></div></div></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"dismiss()\">Close</button> <button type=\"button\" class=\"btn btn-primary\" ng-show=\"loading\">Please wait...</button> <button type=\"submit\" class=\"btn btn-primary\" ng-hide=\"loading\">Continue <i class=\"fa fa-chevron-right\"></i></button></div></form><script type=\"text/ng-template\" id=\"my-messages\"><p ng-message=\"required\" class=\"help-block\">This field is required</p> <p ng-message=\"minlength\" class=\"help-block\">Input too short</p> <p ng-message=\"email\" class=\"help-block\">This field must be an email</p></script>");
$templateCache.put("app/properties/property-edit1.html","<div class=\"row\"><div class=\"col-sm-12\"><a href=\"\" ng-click=\"showMenu()\">Back</a></div><div class=\"col-sm-8\"><h3 style=\"margin-top: 15px;\">Edit Listing : \"{{property.title}}\"</h3></div><div class=\"col-sm-4\"><div class=\"btn-group pull-right\"><label class=\"btn btn-success\" ng-model=\"radioModel\" btn-radio=\"\'Left\'\" uncheckable=\"\">Visible</label> <label class=\"btn btn-success\" ng-model=\"radioModel\" btn-radio=\"\'Middle\'\" uncheckable=\"\">Hidden</label></div></div><div class=\"col-sm-12\"><def>Languages {{currentLocale}}:</def><a href=\"\" ng-click=\"switchLocale(localeChoice.code)\" ng-repeat=\"localeChoice in localeChoicesData\" ng-class=\"{active:currentLocale == localeChoice.code}\">{{localeChoice.name}}</a></div></div><hr><br>-<div ui-view=\"description\"></div>-<form name=\"form\" ng-submit=\"submitForm(form.$valid)\" novalidate=\"\" qn:validate=\"errors\"><div class=\"row\"><div class=\"col-sm-12\"><div class=\"panel panel-default\"><div class=\"panel-heading\"><i class=\"fa fa-chevron-right\"></i> Property description</div><div class=\"panel-body\"><div class=\"row\"><div class=\"col-sm-8\"><div class=\"form-group\"><label>Listing title</label> <input type=\"text\" class=\"form-control\" ng-model=\"translation.title\" placeholder=\"\"></div></div><div class=\"col-sm-4\"><div class=\"form-group\"><label>Price</label><div class=\"input-group\"><input type=\"text\" class=\"form-control\" aria-label=\"Amount (to the nearest dollar)\"> <span class=\"input-group-addon\">USD</span></div></div></div></div><div class=\"form-group\"><label>Summary</label> <textarea class=\"form-control\" cols=\"20\" rows=\"2\"></textarea></div><div class=\"form-group\"><label>Description</label> <textarea class=\"form-control\" cols=\"20\" rows=\"10\"></textarea></div></div><div class=\"panel-footer\"><div class=\"row\"><div class=\"col-xs-12\"><button type=\"submit\" class=\"btn btn-primary pull-right\">Save</button></div></div></div></div><br><br><div class=\"panel panel-default\"><div class=\"panel-heading\"><i class=\"fa fa-chevron-right\"></i> Property features</div><div class=\"panel-body\"><div class=\"row\"><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div></div></div><div class=\"panel-footer\"><div class=\"row\"><div class=\"col-xs-12\"><button type=\"submit\" class=\"btn btn-primary pull-right\">Save</button></div></div></div></div><div class=\"row\"><div class=\"col-xs-12\"><h4><i class=\"fa fa-file-text-o\"></i> Property features</h4><hr></div><div class=\"col-xs-12\"><div class=\"row\"><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-3\"><label>Feature #1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div></div></div></div><br><br><div class=\"row\"><div class=\"col-xs-12\"><h4><i class=\"fa fa-file-code-o\"></i> Property details</h4><hr></div><div class=\"col-sm-3\"><label>Property category</label><select class=\"form-control\"><option>Number of beds</option><option>1 bed</option><option>2 beds</option><option>3</option><option>4</option><option>5+</option></select></div><div class=\"col-sm-3\"><label>Property type</label><select class=\"form-control\"><option>Number of beds</option><option>1 bed</option><option>2 beds</option><option>3</option><option>4</option><option>5+</option></select></div><div class=\"col-sm-3\"><label>Condition of property</label><select class=\"form-control\"><option>New home</option><option>Pre-owned</option></select></div><div class=\"col-sm-3\"><label>Property size</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div></div><br><div class=\"row\"><div class=\"col-sm-3\"><label>Bedrooms</label><select class=\"form-control\" ng-model=\"property.num_bedrooms\"><option value=\"0\">Number of beds</option><option value=\"1\">1 bed</option><option value=\"2\">2 beds</option><option value=\"3\">3 beds</option><option value=\"4\">4 beds</option><option value=\"5\">5+ beds</option></select></div><div class=\"col-sm-3\"><label>Bathrooms</label><select class=\"form-control\"><option>Number of beds</option><option>1 bed</option><option>2 beds</option><option>3</option><option>4</option><option>5+</option></select></div><div class=\"col-sm-3\"><label>Outside space</label><br><label class=\"checkbox-inline\"><input type=\"checkbox\" id=\"inlineCheckbox1\" value=\"option1\"> Garden</label> <label class=\"checkbox-inline\"><input type=\"checkbox\" id=\"inlineCheckbox2\" value=\"option2\"> Parking</label></div><div class=\"col-sm-3\"><label>Investment property</label><br><label class=\"radio-inline\"><input type=\"radio\" name=\"inlineRadioOptions\" id=\"inlineRadio1\" value=\"option1\"> Yes</label> <label class=\"radio-inline\"><input type=\"radio\" name=\"inlineRadioOptions\" id=\"inlineRadio2\" value=\"option2\"> No</label></div></div><br><br><div class=\"row\"><div class=\"col-xs-12\"><h4><i class=\"fa fa-image\"></i> Images and documents</h4><hr></div><div class=\"col-xs-12\"><ul class=\"nav nav-tabs\"><li role=\"presentation\" class=\"active\"><a href=\"#\">Property photos</a></li><li role=\"presentation\"><a href=\"#\">Floor plans</a></li><li role=\"presentation\"><a href=\"#\">Documents</a></li><li role=\"presentation\"><a href=\"#\">Virtual tours</a></li></ul><div id=\"my-dropzone\" class=\"dropzone\" style=\"background: #d2d2d2; width: 100%; height: 350px; display: block;\"></div></div></div><br><br><div class=\"row\"><div class=\"col-xs-12\"><h4><i class=\"fa fa-location-arrow\"></i> Property address</h4><hr></div><div class=\"col-xs-6\"><style>\n                        #map {\n                            border: 1px solid #DDD;\n                            width:100%;\n                            height: 300px;\n                            margin: 10px 0 10px 0;\n                            -webkit-box-shadow: #AAA 0px 0px 15px;\n                        }\n                    </style><div class=\"row\"><div class=\"col-xs-12\"><label>Address line 1</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-12\"><label>Address line 2</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-12\"><label>Town/City</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-8\"><label>State/Province/Region</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-4\"><label>Postcode/ZIP</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div><div class=\"col-xs-12\"><label>Country</label> <input type=\"text\" class=\"form-control\" placeholder=\"\"></div></div><br></div><div class=\"col-xs-6\"><div class=\"map-ad-wrapper\" style=\"height: 300px\"><div id=\"map\"></div><div id=\"legend\">Drag and drop the marker to the correct location</div></div></div></div><br><br><br><br><br><br><div class=\"row\"><div class=\"col-xs-12\"><div class=\"panel panel-default\"><div class=\"panel-body\"><button type=\"submit\" class=\"btn btn-default\">Save</button></div></div></div></div><br><br><br></div></div></form>");
$templateCache.put("app/properties/property-editor.html","<div class=\"row\" style=\"margin-top: 120px\" ng-hide=\"propertyLoader || listLoader || propertyId != 0\"><div class=\"col-sm-4 col-sm-offset-4 text-center\"><i class=\"fa fa-exclamation\" style=\"font-size: 44px;\"></i><br><br><p>Sorry, no property found.</p><br></div></div><div class=\"row\" ng-show=\"propertyLoader || listLoader\"><div class=\"col-sm-12 text-center property-loader\"><i class=\"fa fa-circle-o-notch fa-spin\"></i></div></div><div class=\"row\" ng-hide=\"propertyLoader || listLoader || propertyId == 0\"><div class=\"col-sm-12\"><br><div class=\"row\"><div class=\"col-sm-12\" ng-show=\"isMobile\"><a href=\"\" ng-click=\"hideEditor()\"><i class=\"fa fa-chevron-left\"></i> Back</a></div><div class=\"col-xs-9\"><h3 style=\"margin-top: 15px;\">Edit Listing {{property.id}} : \"{{translation.title}}\"</h3></div><div class=\"col-sm-9\"><strong>Languages :</strong> <a href=\"\" class=\"btn btn-default btn-xs\" ng-click=\"switchLocale(localeChoice.code)\" ng-repeat=\"localeChoice in localesList\" ng-show=\"localeChoice.visible == 1\" ng-class=\"{active:currentLocale == localeChoice.code}\">{{localeChoice.name}}</a></div><div class=\"col-sm-3\"><div class=\"pull-right\"><div class=\"btn-group pull-right\"><label class=\"btn btn-success btn-xs\" ng-change=\"saveVisibility(property.visible)\" ng-model=\"property.visible\" btn-radio=\"1\">Visible</label> <label class=\"btn btn-success btn-xs\" ng-change=\"saveVisibility(property.visible)\" ng-model=\"property.visible\" btn-radio=\"0\">Hidden</label></div></div></div></div><hr><br><div ng-include=\"\'app/properties/forms/description.html\'\" ng-controller=\"PropertyEditDescriptionCtrl\"></div><br><div ng-include=\"\'app/properties/forms/features.html\'\" ng-controller=\"PropertyEditFeaturesCtrl\"></div><br><div ng-include=\"\'app/properties/forms/general.html\'\" ng-controller=\"PropertyEditGeneralCtrl\"></div><br><div ng-include=\"\'app/properties/forms/images.html\'\" ng-controller=\"PropertyEditImagesCtrl\"></div><br><div ng-include=\"\'app/properties/forms/address.html\'\" ng-controller=\"PropertyEditAddressCtrl\"></div><br><div ng-include=\"\'app/properties/forms/pricing.html\'\" ng-controller=\"PropertyEditPricingCtrl\"></div><br></div></div>");
$templateCache.put("app/properties/property-list.html","<div class=\"sticky-bar\" style=\"\"><br><div class=\"row search-property padding-container\" style=\"\"><div class=\"col-lg-12 col-xs-12\"><form class=\"form-inline\" ng-submit=\"performSearch()\"><div class=\"row\"><div class=\"col-xs-9\"><div class=\"form-group\" style=\"width: 100%;\"><div class=\"left-inner-addon\"><i class=\"fa fa-search\"></i> <input type=\"text\" class=\"form-control\" style=\"width: 100%;\" ng-model=\"search\" placeholder=\"Find a property...\"></div></div></div><div class=\"col-xs-3\"><button type=\"submit\" class=\"btn btn-default btn-block\">Go</button></div></div></form></div><div class=\"col-xs-9\"><p class=\"form-control-static\" style=\"margin: 9px 0;\" ng-init=\"additional_search = false\"><a href=\"\" ng-click=\"additional_search = true\" ng-hide=\"additional_search\"><i class=\"fa fa-angle-double-down\"></i> Additional options</a> <a href=\"\" ng-click=\"additional_search = false\" ng-show=\"additional_search\"><i class=\"fa fa-angle-double-up\"></i> Additional options</a></p></div><div class=\"col-xs-3 pull-right\"><ul class=\"pagination pagination-sm pull-right\"><li><a ng-show=\"false\"><span aria-hidden=\"true\"><i class=\"fa-li fa fa-spinner fa-spin\"></i></span></a></li><li ng-hide=\"pageInfo.total <= pageInfo.per_page\"><a href=\"\" ng-class=\"{disabled: pageInfo.prev_page == pageInfo.current_page}\" ng-click=\"setPage(pageInfo.prev_page)\" aria-label=\"Previous\"><span aria-hidden=\"true\"><i class=\"fa fa-chevron-left\"></i></span></a></li><li ng-hide=\"pageInfo.total <= pageInfo.per_page\"><a href=\"\" ng-class=\"{disabled: pageInfo.next_page == pageInfo.current_page}\" ng-click=\"setPage(pageInfo.next_page)\" aria-label=\"Next\"><span aria-hidden=\"true\"><i class=\"fa fa-chevron-right\"></i></span></a></li></ul></div><div class=\"col-md-12\" style=\"display: none;\"><p style=\"font-weight: normal; font-style: italic; margin-top: 12px; font-size: 10px;\">Category: House; Min price: 5,000 GBP</p></div></div><form class=\"padding-container\" ng-show=\"additional_search\" ng-submit=\"submitForm()\"><br><div class=\"row form-vertical\"><div class=\"col-sm-6\"><div class=\"form-group\"><select class=\"form-control\" ng-model=\"searchParams.property_type_id\" ng-options=\"propertyType.id as propertyType.name for propertyType in propertyTypes\"><option value=\"\" selected=\"selected\">Any property type</option></select></div></div><div class=\"col-sm-6\"><div class=\"form-group\"><select class=\"form-control\" ng-model=\"searchParams.listing_type\" ng-options=\"listing_type.value as listing_type.name for listing_type in searchOptions.listing_types\" ng-init=\"searchParams.listing_type=null\"></select></div></div></div><div class=\"row\"><div class=\"col-sm-6\"><div class=\"form-group\"><select class=\"form-control\" ng-model=\"searchParams.min_beds\" ng-options=\"min_bed.value as min_bed.name for min_bed in searchOptions.min_beds\" ng-init=\"searchParams.min_beds=null\"></select></div></div><div class=\"col-sm-6\"><div class=\"form-group\"><select class=\"form-control\" ng-model=\"searchParams.max_beds\" ng-options=\"max_bed.value as max_bed.name for max_bed in searchOptions.max_beds\" ng-init=\"searchParams.max_beds=null\"></select></div></div></div><div class=\"row\"><div class=\"col-sm-6\"><div class=\"form-group\"><div class=\"input-group\"><span class=\"input-group-addon hidden-sm hidden-md\">Min</span> <input type=\"text\" placeholder=\"Min price\" ng-model=\"searchParams.min_price\" class=\"form-control\" aria-label=\"Amount (to the nearest dollar)\"> <span class=\"input-group-addon\">{{settings.currency}}</span></div></div></div><div class=\"col-sm-6\"><div class=\"form-group\"><div class=\"input-group\"><span class=\"input-group-addon hidden-sm hidden-md\">Max</span> <input type=\"text\" placeholder=\"Max price\" ng-model=\"searchParams.max_price\" class=\"form-control\" aria-label=\"Amount (to the nearest dollar)\"> <span class=\"input-group-addon\">{{settings.currency}}</span></div></div></div></div><div class=\"row\" style=\"padding-bottom: 10px; border-bottom: 2px solid #d2d2d2\"><div class=\"col-sm-12\"><button type=\"submit\" ng-hide=\"listLoader\" class=\"btn btn-primary\">Update</button> <button type=\"button\" ng-show=\"listLoader\" class=\"btn btn-primary\">Updating...</button></div></div></form><div class=\"row properties-bar padding-container\"><div class=\"col-xs-8\"><p>Showing {{pageInfo.from}}-{{pageInfo.to}} of {{totalItems}} properties</p></div><div class=\"col-xs-4\"><p><a href=\"\" ng-click=\"addNewProperty()\" class=\"add-property pull-right\"><i class=\"fa fa-plus\"></i> Add new</a></p></div></div><div class=\"listings-scroller\"><div class=\"row loading-row\" ng-show=\"listLoader\"><div class=\"col-xs-12\"><i class=\"fa fa-refresh fa-spin\"></i> Loading...</div></div><div class=\"listings-scrollpane\"><div id=\"scroller\" ng-class=\"{\'scrollable\':!isMobile}\"><div class=\"content\"><div class=\"row listings-row\" ng-show=\"!listLoader && propertiesList.length == 0\"><div class=\"col-xs-12\"><p class=\"text-center\">No properties found.</p><p class=\"text-center\"><a href=\"\" ng-click=\"addNewProperty()\" class=\"btn btn-danger btn-xs\" style=\"padding-left: 10px; padding-right: 10px\"><i class=\"fa fa-plus\"></i> Add a new property</a></p></div></div><div class=\"row listings-row\" ui-sref=\"app.properties.edit({propertyId: property.id})\" ng-click=\"preloadContent(property.id)\" ng-repeat=\"property in propertiesList\" ng-class=\"{\'active\':propertyId == property.id}\"><div class=\"col-md-4 col-lg-3 col-xs-4\"><a class=\"thumbnail\" ui-sref=\"app.properties.edit({propertyId: property.id})\"><img src=\"{{property.main_image}}\" alt=\"\"></a> <a class=\"muted delete-link\" href=\"\" ng-click=\"deleteProperty(property);$event.stopPropagation()\"><i class=\"fa fa-remove\"></i> Delete</a></div><div class=\"col-md-8 col-lg-9 col-xs-8\"><div class=\"property-summary\"><a ui-sref=\"app.properties.edit({propertyId: property.id})\"><h3>{{property.title}}</h3></a><p ng-show=\"property.displayable_address\">{{property.displayable_address}}</p><p ng-show=\"!property.displayable_address\">No address entered</p><p class=\"muted\">Price: {{property.price_formatted}}</p></div></div></div></div></div></div></div></div>");
$templateCache.put("app/pages/pages-edit.html","<form name=\"form\" ng-submit=\"submitForm(form.$valid)\" novalidate=\"\" qn:validate=\"errors\"><div class=\"container-fluid main-content\"><br><br><a ui-sref=\"app.pages.index\"><i class=\"fa fa-chevron-left\"></i> Back to list of pages</a><div class=\"row\"><div class=\"col-md-8\"><h3>{{title}}</h3><hr><div class=\"panels panel-default\"><div class=\"panels-body\"><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label for=\"exampleInputEmail1\">Page title</label> <input type=\"text\" class=\"form-control\" ng-model=\"page.title\" placeholder=\"Enter title here\" ng-change=\"slugify(page.title)\" required=\"\"><div ng-messages=\"form.title.$error\" ng-if=\"form.$submitted\" ng-messages-include=\"my-messages\"></div></div></div></div><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label for=\"exampleInputEmail1\">Slug</label> <input type=\"text\" class=\"form-control\" ng-model=\"page.slug\" placeholder=\"Enter title here\"><div ng-messages=\"form.title.$error\" ng-if=\"form.$submitted\" ng-messages-include=\"my-messages\"></div></div></div></div><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><ul id=\"myTab\" class=\"nav nav-tabs\" role=\"tablist\" style=\"border: none;\"><li role=\"presentation\" ng-class=\"{active: editor == \'content\'}\"><a ng-click=\"editor = \'content\'\">Page content</a></li><li ng-show=\"viewMode == \'edit\' && page.meta.regions.length > 0\" role=\"presentation\" ng-class=\"{active: editor == \'components\'}\"><a ng-click=\"editor = \'components\'\">Regions</a></li><li ng-if=\"false\" role=\"presentation\" ng-class=\"{active: editor == \'yaml\'}\"><a ng-click=\"editor = \'yaml\'\">Custom data (advanced)</a></li></ul><div ng-show=\"editor == \'content\'\"><textarea ckeditor=\"editorOptions\" ng-model=\"page.content\"></textarea></div><div ng-show=\"editor == \'components\'\"><div class=\"row\"><div class=\"col-sm-12\"><div class=\"panel panel-default\"><div class=\"panel-body\" style=\"min-height: 350px;\"><table class=\"table table-condensed\"><thead><tr><th>Region</th><th>Type</th><th>Options</th></tr></thead><tbody><tr ng-repeat=\"region in page.meta.regions\"><td><a href=\"\" ng-click=\"regionEdit(region.id, currentLocale)\">{{region.name}}</a></td><td>{{region.type}}</td><td><a href=\"\" ng-click=\"regionEdit(region.id, currentLocale)\" class=\"muted\"><i class=\"fa fa-pencil\"></i> Edit</a></td></tr></tbody></table></div><div class=\"panel-footer\"><h6><em>Click on a region to edit</em></h6></div></div></div></div></div><div ng-show=\"editor == \'yaml\'\"><div ui-ace=\"{useWrapMode : true,showGutter: false,theme:\'twilight\',mode: \'yaml\',firstLineNumber: 5,onLoad: aceLoaded,onChange: aceChanged}\" ng-model=\"page.yaml\"></div></div></div></div></div></div></div><div class=\"row\"><div class=\"col-md-12\"><div class=\"panel panel-default\" style=\"margin-top: 15px\"><div class=\"panel-heading\">SEO details</div><div class=\"panel-body\"><div class=\"form-group\"><label class=\"col-sm-2 control-label\">SEO title</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" ng-model=\"page.seo_title\"> <span id=\"helpBlock\" class=\"help-block\">Ideally a maximum of 70 characters</span></div></div><div class=\"form-group\"><label for=\"inputPassword3\" class=\"col-sm-2 control-label\">Meta description</label><div class=\"col-sm-10\"><textarea rows=\"3\" class=\"form-control\" ng-model=\"page.seo_meta_description\"></textarea> <span id=\"helpBlock\" class=\"help-block\">Ideally a maximum of 160 characters</span></div></div><div class=\"form-group\"><label for=\"inputPassword3\" class=\"col-sm-2 control-label\">Meta keywords</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" ng-model=\"page.seo_meta_keywords\"></div></div></div></div></div></div></div><div class=\"col-md-4\"><div class=\"row\"><div class=\"col-md-12\"><div class=\"panel panel-default\" style=\"margin-top: 15px\"><div class=\"panel-heading\">Publish</div><div class=\"panel-body\"><p ng-show=\"page.visibility == \'HIDDEN\'\">Visibility: <strong>Hidden</strong> <a href=\"\" ng-click=\"page.visibility = \'VISIBLE\'\">(toggle)</a></p><p ng-show=\"page.visibility == \'VISIBLE\'\">Visibility: <strong>Visible</strong> <a href=\"\" ng-click=\"page.visibility = \'HIDDEN\'\">(toggle)</a></p><div class=\"form-group\"><label>Template</label><select class=\"form-control\" ng-model=\"page.template\" ng-options=\"template.view as template.name for template in templates\"></select></div><div class=\"form-group\"><label>Route</label> <input type=\"text\" class=\"form-control\" ng-model=\"page.handler\" placeholder=\"e.g. for-sale\"><p class=\"help-block\"><em>Used to link to call multilingual pages.</em></p></div><div class=\"form-group\"><label>Language</label><select class=\"form-control\" disabled=\"\"><option>{{page.locale}}</option></select></div></div><div class=\"panel-footer\"><button type=\"submit\" ng-hide=\"saving\" class=\"btn btn-primary\">Save page</button> <button type=\"button\" ng-show=\"saving\" class=\"btn btn-primary\">Saving...</button></div></div></div></div></div></div><br><br></div></form><script type=\"text/ng-template\" id=\"my-messages\"><p ng-message=\"required\" class=\"help-block\">This field is required</p> <p ng-message=\"minlength\" class=\"help-block\">Input too short</p> <p ng-message=\"email\" class=\"help-block\">This field must be an email</p></script>");
$templateCache.put("app/pages/pages.html","<div class=\"container-fluid no-padding\"><div class=\"container-fluid main-content\"><div class=\"row\"><div class=\"col-md-12\"><br><div class=\"row\"><div class=\"col-md-8\"><h3>Pages</h3></div><div class=\"col-md-4\"><br><form class=\"form-inline pull-right\" ng-submit=\"performSearch()\"><div class=\"form-group\"><div class=\"left-inner-addon\"><i class=\"fa fa-search\"></i> <input type=\"text\" class=\"form-control\" ng-model=\"search\" placeholder=\"Search for a page...\"></div></div><button type=\"submit\" class=\"btn btn-default\">Search</button></form></div></div><br><div class=\"row\" style=\"margin-top: 20px; margin-bottom: 20px;\"><div class=\"col-md-9\"><form class=\"form-inline pull-left\"><div class=\"form-group\"><p class=\"form-control-static\" style=\"float: left; margin-right: 5px\">Sort by :</p><select name=\"action\" class=\"form-control\" style=\"max-width: 175px\" ng-model=\"sort\" ng-options=\"sortOption as sortOption.name for sortOption in sortOptions\" ng-change=\"performSearch()\"></select></div><div class=\"form-group\" style=\"padding-right: 10px; padding-left: 10px;\">|</div><div class=\"form-group\"><p class=\"form-control-static\" style=\"float: left; margin-right: 5px\">Show only :</p><select name=\"action\" class=\"form-control\" ng-model=\"currentLocale\" ng-change=\"changeLocale()\" style=\"max-width: 150px\" ng-options=\"localeChoice.code as localeChoice.name for localeChoice in localesList\"></select></div><div class=\"form-group\" style=\"padding-right: 10px; padding-left: 10px;\">|</div><div class=\"form-group\"><a class=\"btn btn-default btn-new\" ui-sref=\"app.pages.create\"><i class=\"fa fa-plus\"></i> Add a new page</a></div></form></div><div class=\"col-md-3\"><div class=\"pull-right\" style=\"margin-top: 0px;\"><pagination style=\"margin-top: 0px; margin-bottom: 0;\" total-items=\"totalItems\" ng-model=\"currentPage\" max-size=\"maxSize\" class=\"pagination-sm\" boundary-links=\"false\" rotate=\"false\" num-pages=\"numPages\" ng-change=\"pageChanged()\"></pagination></div></div></div><table class=\"table table-striped table-bordered\"><thead><tr><th class=\"col-md-9 sorter\" ng-click=\"tableSort(\'title\')\" table-sorter=\"\" info=\"{ name: \'title\', sort: sort }\">Title</th><th style=\"width: 40px;\" ng-repeat=\"localeChoice in localesList\">{{localeChoice.code.toUpperCase()}}</th></tr></thead><tbody><tr ng-repeat=\"page in pagesList\" style=\"height: 60px\"><td><a ui-sref=\"app.pages.edit({pageId: page.page_id, locale: currentLocale})\"><strong>{{page.title}}</strong></a> <a ng-click=\"deletePage(page)\" class=\"delete-link muted\" href=\"\"><small>(Delete)</small></a><br><p>{{ page.seo_meta_description != \'\' ? page.seo_meta_description : \" -- no meta description -- \" }} <span class=\"text-italic\">Last modified: {{page.last_modified}}</span></p></td><td ng-repeat=\"localeChoice in localesList\" style=\"vertical-align: middle\"><div style=\"line-height: 80px\"><a ui-sref=\"app.pages.edit({pageId: page.page_id, locale: localeChoice.code})\" class=\"locale-status\" ng-class=\"{\'locale-info\': page.translated[localeChoice.code]}\"><i class=\"fa fa-file-text\"></i></a></div></td></tr></tbody></table><br><div class=\"pagination-text\">Showing {{pageInfo.from}} - {{pageInfo.to}} <small>of {{pageInfo.total}}</small></div><nav class=\"disabled\"></nav></div></div><br><br></div></div><script type=\"text/ng-template\" id=\"table-sorter.html\"><span ng-transclude></span> <a href=\"\" class=\"\" ng-show=\"info.sort.field != info.name\"></a> <a href=\"\" class=\"asc\" ng-show=\"info.sort.direction == \'asc\' && info.sort.field == info.name\"><i class=\"fa fa-sort-asc\"></i></a> <a href=\"\" class=\"desc\" ng-show=\"info.sort.direction == \'desc\' && info.sort.field == info.name\"><i class=\"fa fa-sort-desc\"></i></a></script><script type=\"text/ng-template\" id=\"locale-icon.html\"><span ng-transclude></span> <a href=\"\" class=\"\" ng-show=\"info.sort.field != info.name\"></a> <a href=\"\" class=\"asc\" ng-show=\"info.sort.direction == \'asc\' && info.sort.field == info.name\"><i class=\"fa fa-sort-asc\"></i></a> <a href=\"\" class=\"desc\" ng-show=\"info.sort.direction == \'desc\' && info.sort.field == info.name\"><i class=\"fa fa-sort-desc\"></i></a></script>");
$templateCache.put("app/prospects/prospects.html","<div class=\"container-fluid no-padding\"><div class=\"container-fluid main-content\"><div class=\"row\"><div class=\"col-md-12\"><br><div class=\"row\"><div class=\"col-md-8\"><h3>Members</h3></div><div class=\"col-md-4\"><br><form class=\"form-inline pull-right\" ng-submit=\"performSearch()\"><div class=\"form-group\"><div class=\"left-inner-addon\"><i class=\"fa fa-search\"></i> <input type=\"text\" class=\"form-control\" ng-model=\"search\" placeholder=\"Search for a user\"></div></div><button type=\"submit\" class=\"btn btn-default\">Search</button></form></div></div><br><br><ul class=\"nav nav-tabs\"><li><a ui-sref=\"app.members.index({ memberType: \'member\' })\" data-toggle=\"tab\">All members</a></li><li><a ui-sref=\"app.members.index({ memberType: \'advertiser\' })\" data-toggle=\"tab\">Estate agents</a></li><li><a ui-sref=\"app.members.index({ memberType: \'seller\' })\" data-toggle=\"tab\">Sellers/Landlords</a></li><li><a ui-sref=\"app.members.index({ memberType: \'prospect\' })\" data-toggle=\"tab\">Registered prospects</a></li><li class=\"pull-right active\"><a ui-sref=\"app.prospects.index({ memberType: \'prospect\' })\" data-toggle=\"tab\">Unregistered prospects</a></li></ul><div class=\"blank-slate\" ng-show=\"membersList != null && membersList.length == 0\"><br><br><i class=\"fa fa-users\"></i><h2>Sorry, no prospects found</h2></div><div ng-show=\"membersList != null && membersList.length > 0\"><div class=\"row\" style=\"margin-top: 20px; margin-bottom: 20px;\"><div class=\"col-md-8\"></div><div class=\"col-md-4\"><div class=\"pull-right\" style=\"margin-top: 0px;\"><pagination style=\"margin-top: 0px; margin-bottom: 0;\" total-items=\"totalItems\" ng-model=\"currentPage\" max-size=\"maxSize\" class=\"pagination-sm\" boundary-links=\"false\" rotate=\"true\" num-pages=\"numPages\" ng-change=\"pageChanged()\"></pagination></div></div></div><table class=\"table table-striped table-bordered\"><thead><tr><th class=\"sorter\" ng-click=\"tableSort(\'email\')\" table-sorter=\"\" info=\"{ name: \'email\', sort: sort }\">Email</th><th class=\"sorter\" ng-click=\"tableSort(\'name\')\" table-sorter=\"\" info=\"{ name: \'name\', sort: sort }\">Name</th><th class=\"sorter\" ng-click=\"tableSort(\'created_at\')\" table-sorter=\"\" info=\"{ name: \'role\', sort: sort }\">Date created</th></tr></thead><tbody><tr ng-repeat=\"member in membersList\"><td><div class=\"row\"><div class=\"col-md-12\"><div style=\"padding-left: 5px;\"><strong>{{member.email}}</strong> <a ng-click=\"deleteMember(member)\" class=\"delete-link muted\" href=\"\"><small>(Delete)</small></a></div></div></div></td><td>{{member.firstname}} {{member.lastname}}</td><td>Prospect</td><td>{{member.registered_at}}</td></tr></tbody></table><br><div class=\"pagination-text\">Showing {{pageInfo.from}} - {{pageInfo.to}} <small>of {{pageInfo.total}}</small></div><nav class=\"disabled\"></nav></div></div><div class=\"col-md-3\" ng-if=\"false\"><div class=\"row\"><div class=\"col-md-10 col-md-offset-1\"><br><br><div class=\"well\"><h4>Membership information</h4><p><strong>Registered members</strong> are users that have registered on your website and are actively looking for properties.</p><br><p><strong>Prospective buyers</strong> are users that have made in interest in a property or list of properties on your site without registering.</p><br></div></div></div></div></div><br><br></div></div><script type=\"text/ng-template\" id=\"table-sorter.html\"><span ng-transclude></span> <a href=\"\" class=\"\" ng-show=\"info.sort.field != info.name\"></a> <a href=\"\" class=\"asc\" ng-show=\"info.sort.direction == \'asc\' && info.sort.field == info.name\"><i class=\"fa fa-sort-asc\"></i></a> <a href=\"\" class=\"desc\" ng-show=\"info.sort.direction == \'desc\' && info.sort.field == info.name\"><i class=\"fa fa-sort-desc\"></i></a></script>");
$templateCache.put("app/regions/regions-edit.html","<div class=\"modal-header\"><button type=\"button\" class=\"close\" ng-click=\"dismiss()\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button><h4 class=\"modal-title\">Editing region : {{region.name}}</h4></div><div class=\"modal-body\"><div class=\"row\"><div class=\"col-md-12\" style=\"overflow: hidden;\"><div style=\"height: 400px; overflow-y: scroll; overflow-x: hidden;margin-bottom: 20px;\"><div class=\"loading\" ng-show=\"loading\" style=\"height: 400px; line-height: 400px; text-align: center;\">Loading...</div><div id=\"form\"></div></div></div></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"dismiss()\">Close</button> <button type=\"button\" class=\"btn btn-primary\" ng-show=\"saving\">Saving...</button> <button type=\"button\" class=\"btn btn-primary\" ng-hide=\"saving\" ng-click=\"submitForm()\">Save</button></div></div>");
$templateCache.put("app/regions/regions.html","<div class=\"container-fluid no-padding\"><div class=\"container-fluid main-content\"><div class=\"row\"><div class=\"col-md-12\"><br><div class=\"row\"><div class=\"col-md-8\"><h3>Snippets</h3></div></div><br><br><table class=\"table table-striped table-bordered\"><thead><tr><th class=\"col-md-9 sorter\" ng-click=\"tableSort(\'name\')\" table-sorter=\"\" info=\"{ name: \'name\', sort: sort }\">Title</th><th style=\"width: 40px;\" ng-repeat=\"localeChoice in localesList\">{{localeChoice.code.toUpperCase()}}</th></tr></thead><tbody><tr ng-repeat=\"region in regionsList\" style=\"height: 60px\"><td><a href=\"\" ng-click=\"regionEdit(region.id, currentLocale)\"><strong>{{region.name}}</strong></a></td><td ng-repeat=\"localeChoice in localesList\" style=\"vertical-align: middle\"><div style=\"line-height: 80px\"><a href=\"\" ng-click=\"regionEdit(region.id, localeChoice.code)\" class=\"locale-status\" ng-class=\"{\'locale-info\': region.translated[localeChoice.code]}\"><i class=\"fa fa-file-text\"></i></a></div></td></tr></tbody></table><br></div></div><br><br></div></div><script type=\"text/ng-template\" id=\"table-sorter.html\"><span ng-transclude></span> <a href=\"\" class=\"\" ng-show=\"info.sort.field != info.name\"></a> <a href=\"\" class=\"asc\" ng-show=\"info.sort.direction == \'asc\' && info.sort.field == info.name\"><i class=\"fa fa-sort-asc\"></i></a> <a href=\"\" class=\"desc\" ng-show=\"info.sort.direction == \'desc\' && info.sort.field == info.name\"><i class=\"fa fa-sort-desc\"></i></a></script><script type=\"text/ng-template\" id=\"locale-icon.html\"><span ng-transclude></span> <a href=\"\" class=\"\" ng-show=\"info.sort.field != info.name\"></a> <a href=\"\" class=\"asc\" ng-show=\"info.sort.direction == \'asc\' && info.sort.field == info.name\"><i class=\"fa fa-sort-asc\"></i></a> <a href=\"\" class=\"desc\" ng-show=\"info.sort.direction == \'desc\' && info.sort.field == info.name\"><i class=\"fa fa-sort-desc\"></i></a></script>");
$templateCache.put("app/settings/navbar.html","<ul class=\"nav nav-tabs\"><li ui-sref-active=\"active\"><a ui-sref=\"app.settings.index\" data-toggle=\"tab\">General</a></li><li ui-sref-active=\"active\"><a ui-sref=\"app.settings.languages\" data-toggle=\"tab\">Languages</a></li><li ui-sref-active=\"active\"><a ui-sref=\"app.settings.properties\">Property types</a></li><li ui-sref-active=\"active\"><a ui-sref=\"app.settings.admins\">Administrators</a></li></ul>");
$templateCache.put("app/settings/payments.partial.html","<div ui-tree-handle=\"\" class=\"panel panel-default tree-node tree-node-content\" ng-controller=\"PaymentMethodCtrl\"><div class=\"panel-heading\" ng-class=\"{active: !isCollapsed}\"><div class=\"row\"><div class=\"col-md-6\"><div nodrag=\"\"><a href=\"\" ng-click=\"isCollapsed = !isCollapsed\"><i ng-hide=\"isCollapsed\" class=\"fa fa-minus\"></i></a> <a href=\"\" ng-click=\"isCollapsed = !isCollapsed\"><i ng-show=\"isCollapsed\" class=\"fa fa-plus\"></i></a> <span style=\"cursor: pointer\" ng-click=\"isCollapsed = !isCollapsed\">&nbsp;&nbsp;&nbsp;{{paymentMethod.name}}&nbsp;</span> (<a href=\"\" ng-show=\"paymentMethod.status == 1\" ng-click=\"paymentMethod.status = 0\" class=\"real-link\">Disable</a><a href=\"\" ng-show=\"paymentMethod.status == 0\" ng-click=\"paymentMethod.status = 1\" class=\"real-link\">Enable</a>)</div></div><div class=\"col-md-3 pull-right\"><div class=\"status-enabled pull-right\" ng-show=\"paymentMethod.status != 0\"><i class=\"fa fa-check\"></i>&nbsp;&nbsp;Enabled</div><div class=\"status-disabled pull-right\" ng-show=\"paymentMethod.status == 0\"><i class=\"fa fa-circle\"></i>&nbsp;&nbsp;Disabled</div></div></div></div><div class=\"panel-body\" nodrag=\"\" ng-show=\"isCollapsed\"><form class=\"form-horizontal ng-pristine ng-valid\" ng-submit=\"savePaymentMethod(paymentMethod)\"><ng-include src=\"\'app/settings/payment-methods/\'+paymentMethod.handle+\'.html\'\"></ng-include><hr><div class=\"row\"><div class=\"col-md-6\"><a class=\"muted delete-link\"><i class=\"fa fa-times\"></i> Delete</a></div><div class=\"col-md-6\"><button type=\"button\" class=\"btn btn-primary pull-right\" ng-show=\"paymentMethod.saving\">Saving...</button> <button type=\"submit\" class=\"btn btn-primary pull-right\" ng-hide=\"paymentMethod.saving\">Save changes</button></div></div></form></div></div><ol ui-tree-nodes=\"\" ng-model=\"paymentMethod.nodes\" ng-class=\"{hidden: collapsed}\"><li ng-repeat=\"paymentMethod in paymentMethod.nodes\" ui-tree-node=\"\" ng-include=\"\'app/settings/payments.partial.html\'\"></li></ol>");
$templateCache.put("app/settings/settings-admins-create.html","<form name=\"form\" ng-submit=\"submitForm(form.$valid)\" novalidate=\"\" qn:validate=\"errors\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" ng-click=\"dismiss()\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button><h4 class=\"modal-title\">Adding new admin</h4></div><div class=\"modal-body\"><div class=\"row\"><div class=\"col-md-6\"><div class=\"form-group\"><label>Username</label> <input type=\"text\" ng-model=\"member.username\" class=\"form-control\" name=\"username\" server-error=\"\"><p ng-show=\"form.username.$invalid && form.$submitted\" class=\"help-block\">{{ errors.username }}</p></div></div><div class=\"col-md-6\"><div class=\"form-group\"><label>Email address</label> <input type=\"email\" name=\"email\" ng-model=\"member.email\" class=\"form-control\" ng-required=\"true\" ng-pattern=\"/^[_a-z0-9-]+(\\.[_a-z0-9-]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,15})$/\" server-error=\"\"><div ng-messages=\"form.email.$error\" ng-if=\"form.$submitted\" ng-messages-include=\"my-messages\"><p ng-message=\"server\" class=\"help-block\">{{ errors.email }}</p></div></div></div></div><div class=\"row\"><div class=\"col-md-6\"><div class=\"form-group\"><label>Password</label> <input type=\"password\" name=\"password\" ng-model=\"member.password\" class=\"form-control\" server-error=\"\"><p ng-show=\"form.password.$error.server && form.$submitted\" class=\"help-block\">{{ errors.password }}</p></div></div><div class=\"col-md-6\"><div class=\"form-group\"><label>Confirm password</label> <input type=\"password\" name=\"password_confirmation\" ng-model=\"member.password_confirmation\" class=\"form-control\" ng-match=\"member.password\" server-error=\"\"><p ng-show=\"form.password_confirmation.$error.match && form.$submitted\" class=\"help-block\">Passwords must match</p><p ng-show=\"form.password_confirmation.$error.server && form.$submitted\" class=\"help-block\">{{ errors.password_confirmation }}</p></div></div></div><br><div class=\"row\"><div class=\"col-md-12\"><div class=\"panel panel-default\" ng-show=\"member.is_admin\"><div class=\"panel-heading\">Permissions</div><div class=\"panel-body\"><div ng-include=\"\'app/members/blocks/admin-access.html\'\"></div></div></div></div></div></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"dismiss()\">Close</button> <button type=\"submit\" class=\"btn btn-primary\">Save admin</button></div></form><script type=\"text/ng-template\" id=\"my-messages\"><p ng-message=\"required\" class=\"help-block\">This field is required</p> <p ng-message=\"minlength\" class=\"help-block\">Input too short</p> <p ng-message=\"email\" class=\"help-block\">This field must be an email</p></script>");
$templateCache.put("app/settings/settings-admins.html","<div class=\"container-fluid no-padding\"><div class=\"container-fluid main-content\"><div class=\"row\"><div class=\"col-md-12\"><br><h3>Settings</h3><br><br><div ng-include=\"\'app/settings/navbar.html\'\"></div><br><div class=\"row\"><div class=\"col-md-8\"><div class=\"blank-slate\" ng-show=\"membersList != null && membersList.length == 0\"><br><br><i class=\"fa fa-users\"></i><h2>Sorry, no adminstrators found</h2></div><div ng-show=\"membersList != null && membersList.length > 0\"><table class=\"table table-striped table-bordered\"><thead><tr><th class=\"sorter\">Username</th><th class=\"sorter\" ng-click=\"tableSort(\'created_at\')\" table-sorter=\"\" info=\"{ name: \'role\', sort: sort }\">Date registered</th></tr></thead><tbody><tr ng-repeat=\"member in membersList\"><td><div class=\"row\"><div class=\"col-md-12\"><div style=\"padding-left: 5px;\"><a href=\"\" ui-sref=\"app.members.edit({memberId: member.id})\"><strong>{{member.username}}</strong></a> <a ng-click=\"deleteMember(member)\" class=\"delete-link muted\" href=\"\"><small>(Delete)</small></a></div></div><div class=\"col-md-12\"><span class=\"muted\">Can manage: {{showPermissions(member.admin_permissions)}}</span></div></div></td><td>{{member.registered_at}}</td></tr></tbody></table><br><div class=\"col-md-4\"><div class=\"pagination-text\">Showing {{pageInfo.from}} - {{pageInfo.to}} <small>of {{pageInfo.total}}</small></div></div><div class=\"col-md-8\"><div class=\"pull-right\" style=\"margin-top: 0px;\"><pagination style=\"margin-top: 0px; margin-bottom: 0;\" total-items=\"totalItems\" ng-model=\"currentPage\" max-size=\"maxSize\" class=\"pagination-sm\" boundary-links=\"false\" rotate=\"true\" num-pages=\"numPages\" ng-change=\"pageChanged()\"></pagination></div></div></div></div><div class=\"col-md-4\"><div class=\"row\"><div class=\"col-md-10 col-md-offset-2\"><div class=\"well\"><h4>Adminstrators information</h4><p>You can give users admin access to your control panel and manage their permissions</p><br><a class=\"btn btn-primary\" ng-click=\"addNewAdmin()\" href=\"\">Add an admin</a></div></div></div></div></div><br><br></div></div></div></div><script type=\"text/ng-template\" id=\"table-sorter.html\"><span ng-transclude></span> <a href=\"\" class=\"\" ng-show=\"info.sort.field != info.name\"></a> <a href=\"\" class=\"asc\" ng-show=\"info.sort.direction == \'asc\' && info.sort.field == info.name\"><i class=\"fa fa-sort-asc\"></i></a> <a href=\"\" class=\"desc\" ng-show=\"info.sort.direction == \'desc\' && info.sort.field == info.name\"><i class=\"fa fa-sort-desc\"></i></a></script>");
$templateCache.put("app/settings/settings-analytics.html","<div class=\"container-fluid no-padding\"><div class=\"container-fluid main-content\"><div ng-include=\"navbar.html\"></div><div class=\"row\"><div class=\"col-md-12\"><br><h3>Settings</h3><br><br><div ng-include=\"\'app/settings/navbar.html\'\"></div><br><br><div class=\"row\"><div class=\"col-md-3\"><h4>Property categories</h4><p>Edit your store information. The store name shows up on your storefront, while the title and meta description help define how your store shows up on search engines.</p></div><div class=\"col-md-7 col-md-offset-1\"><table class=\"table\"><thead><tr><th>Property type</th><th>Search criteria type</th></tr></thead><tbody><tr style=\"border-top: none\"><td><a href=\"#\"><strong>Detached house</strong></a></td><td><a href=\"#\"><strong>House</strong></a></td><td><a href=\"#\">Edit</a> | <a href=\"#\">Delete</a></td></tr><tr><td><a href=\"#\"><strong>General</strong></a></td><td><a href=\"#\"><strong>House</strong></a></td><td><a href=\"#\">Edit</a> | <a href=\"#\">Delete</a></td></tr></tbody></table><form><br><br><div class=\"row\"><div class=\"col-md-5\"><div class=\"form-group\"><label for=\"exampleInputEmail1\">Property type</label><br><input type=\"email\" class=\"form-control\" id=\"exampleInputEmail1\" placeholder=\"\"></div></div><div class=\"col-md-5\"><div class=\"form-group\"><label for=\"exampleInputPassword1\">Search criteria type</label><br><select class=\"form-control\"><option>Not Specified</option></select></div></div><div class=\"col-md-2\"><div class=\"form-group\"><label for=\"exampleInputPassword1\">&nbsp;</label><br><button type=\"submit\" class=\"btn btn-default\">Submit</button></div></div></div></form></div></div><br><hr><br><div class=\"row\"><div class=\"col-md-3\"><h4>Search criteria types</h4><p>This address will appear on your invoices and will be used to calculate your shipping rates.</p></div><div class=\"col-md-7 col-md-offset-1\"><table class=\"table\"><thead><tr><th>Search criteria type</th></tr></thead><tbody><tr style=\"border-top: none\"><td><a href=\"#\"><strong>House</strong></a></td><td><a href=\"#\">Edit</a> | <a href=\"#\">Delete</a></td></tr><tr><td><a href=\"#\"><strong>House</strong></a></td><td><a href=\"#\">Edit</a> | <a href=\"#\">Delete</a></td></tr></tbody></table><form><br><br><div class=\"row\"><div class=\"col-md-5\"><div class=\"form-group\"><label for=\"exampleInputPassword1\">Search criteria type</label><br><input type=\"email\" class=\"form-control\" id=\"exampleInputEmail1\" placeholder=\"\"></div></div><div class=\"col-md-2\"><div class=\"form-group\"><label for=\"exampleInputPassword1\">&nbsp;</label><br><button type=\"submit\" class=\"btn btn-default\">Submit</button></div></div></div></form></div><br></div></div><br><br></div></div></div>");
$templateCache.put("app/settings/settings-languages.html","<div class=\"container-fluid no-padding\"><div class=\"container-fluid main-content\"><div class=\"row\"><div class=\"col-md-12\"><br><h3>Languages</h3><br><br><div ng-include=\"\'app/settings/navbar.html\'\"></div><br><br><div class=\"row\"><div class=\"col-md-3\"><h4>Availiable languages</h4><p>Edit your language/locale information. The languages show up in your theme. If you want to add a locale instead please use the syntax lang-COUNTRY (e.g. en-GB, en-US). You can re-order the languages by clicking the up and down arrows.</p></div><div class=\"col-md-7 col-md-offset-1\"><table class=\"table\"><thead><tr><th style=\"width: 45px;\">&nbsp;</th><th style=\"width: 20px;\">&nbsp;</th><th class=\"col-sm-5\">Language name</th><th class=\"col-sm-3\">Language code</th><th>&nbsp;</th></tr></thead><tbody><tr style=\"border-top: none\" ng-repeat-start=\"(localeKey, localeValue) in localesList | orderBy:\'position\':reverse\" ng-hide=\"editKey == localeValue.id\"><td><a href=\"\" style=\"margin-right: 2px;\" ng-click=\"move(localeKey, \'up\')\"><i class=\"fa fa-arrow-up\"></i></a><a href=\"\" ng-click=\"move(localeKey, \'down\')\"><i class=\"fa fa-arrow-down\"></i></a></td><td ng-show=\"false\"><a ng-show=\"currentLocale == localeValue.code\" class=\"muted secondary-link\" title=\"Default language\"><i class=\"fa fa-circle\"></i></a> <a href=\"\" ng-click=\"setDefaultLocaleLink(localeValue.code)\" ng-show=\"currentLocale != localeValue.code\" class=\"muted secondary-link\" title=\"Make default\"><i class=\"fa fa-circle-o\"></i></a></td><td ng-show=\"true\"><a ng-show=\"localeValue.visible\" ng-click=\"setVisible(localeValue, 0)\" class=\"muted secondary-link\" title=\"Default language\"><i class=\"fa fa-circle\"></i></a> <a href=\"\" ng-click=\"setVisible(localeValue, 1)\" ng-show=\"!localeValue.visible\" class=\"muted secondary-link\" title=\"Make default\"><i class=\"fa fa-circle-o\"></i></a></td><td><a href=\"\" ng-click=\"edit(localeValue.id)\"><strong>{{localeValue.name}}</strong></a> (<a href=\"\" ng-click=\"deleteLocale(localeValue)\" class=\"muted delete-link\">Delete</a>)</td><td><a href=\"\" ng-click=\"edit(localeValue.id)\"><strong>{{localeValue.code}}</strong></a></td><td><a href=\"\" ng-click=\"edit(localeValue.id)\">Edit</a></td></tr><tr style=\"border-top: none\" ng-repeat-end=\"(localeKey, localeValue) in localesList | orderBy:\'position\':reverse\" ng-show=\"editKey == localeValue.id\"><td><a href=\"#\" style=\"margin-right: 2px;\"><i class=\"fa fa-arrow-up\"></i></a><a href=\"#\"><i class=\"fa fa-arrow-down\"></i></a></td><td>&nbsp;</td><td><input type=\"text\" ng-model=\"localeCopy.name\" class=\"form-control\"></td><td><input type=\"text\" style=\"width: 60px;\" class=\"form-control\" ng-model=\"localeCopy.code\" placeholder=\"e.g. en, es, fr...\"></td><td></td><td ng-hide=\"localeUpdating\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"updateLocale(localeValue, localeCopy)\">Update</button> | <a href=\"\" ng-click=\"cancelEdit(localeValue.id)\">Cancel</a></td><td ng-show=\"localeUpdating\"><button type=\"button\" class=\"btn btn-default\"><i class=\"fa fa-refresh fa-spin\"></i> Updating</button></td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td><input type=\"text\" ng-model=\"additional.name\" typeahead=\"item.nativeName as item.nativeName for item in languageOptions | filter:$viewValue | limitTo:8\" class=\"form-control\" typeahead-on-select=\"additionalSelect($item, $model, $label)\"></td><td><input type=\"text\" class=\"form-control\" ng-model=\"additional.code\" placeholder=\"e.g. en, es, fr...\"></td><td><button type=\"button\" class=\"btn btn-default\" ng-click=\"addLocale()\">Add language</button></td></tr></tbody></table><form ng-submit=\"setDefaultLocaleForm()\"><br><br><div class=\"row\"><div class=\"col-md-5\"><div class=\"form-group\"><label>Default language</label><br><select class=\"form-control\" ng-model=\"currentLocale\" ng-options=\"item.code as item.name for item in localesList\"></select></div></div><div class=\"col-md-2\"><div class=\"form-group\"><label>&nbsp;</label><br><button type=\"submit\" class=\"btn btn-default\">Submit</button></div></div></div></form></div></div><br><br></div></div><br><br></div></div>");
$templateCache.put("app/settings/settings-packages.html","<div class=\"container-fluid no-padding\"><div class=\"container-fluid main-content\"><div class=\"row\"><div class=\"col-md-12\"><br><h3>Settings</h3><br><br><div ng-include=\"\'app/settings/navbar.html\'\"></div><br><br><div class=\"row\"><div class=\"col-md-3\"><h4>Credit prices</h4><p>Deposits are in {{settings.default_currency}} and are non-refundable.</p></div><div class=\"col-md-7 col-md-offset-1\"><table class=\"table\"><thead><tr><th class=\"col-md-4\">Credits</th><th class=\"col-md-4\">Price ({{settings.default_currency}})</th></tr></thead><tbody><tr ng-repeat-start=\"(rowKey, package) in packageList | orderBy:\'price\':reverse\" ng-hide=\"editPackageKey == package.id\"><td class=\"col-md-4\"><a href=\"\" ng-click=\"editPackage(package.id)\"><strong>{{package.credits}} credits</strong></a></td><td class=\"col-md-4\"><strong>{{package.price | currency: \" \" }}</strong></td><td><a href=\"\" ng-click=\"editPackage(package.id)\">Edit</a> | <a href=\"\" ng-click=\"deletePackage(package)\">Delete</a></td></tr><tr ng-repeat-end=\"(rowKey, package) in packageList | orderBy:\'price\':reverse\" ng-show=\"editPackageKey == package.id\"><td class=\"col-md-4\"><input type=\"text\" ng-model=\"packageCopy.credits\" class=\"form-control\"></td><td class=\"col-md-4\"><input type=\"text\" ng-model=\"packageCopy.price\" class=\"form-control\"></td><td ng-hide=\"packageUpdating\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"updatePackage(package, packageCopy)\">Update</button> | <a href=\"\" ng-click=\"cancelEditPackage(package.id)\">Cancel</a></td><td ng-show=\"packageUpdating\"><button type=\"button\" class=\"btn btn-default\"><i class=\"fa fa-refresh fa-spin\"></i> Updating</button></td></tr></tbody></table><form ng-submit=\"addPackage()\"><br><div class=\"row\"><div class=\"col-md-4\"><div class=\"form-group\"><label>Credits</label><br><input type=\"text\" class=\"form-control\" ng-model=\"newPackage.credits\"></div></div><div class=\"col-md-4\"><div class=\"form-group\"><label>Price</label><br><input type=\"text\" class=\"form-control\" ng-model=\"newPackage.price\"></div></div><div class=\"col-md-2\"><div class=\"form-group\"><label>&nbsp;</label><br><button type=\"submit\" class=\"btn btn-default\" ng-hide=\"savingPackage\">Add new</button> <button type=\"button\" class=\"btn btn-default\" ng-show=\"savingPackage\">Saving...</button></div></div></div></form><br><hr><br><h4>Monthly subscription</h4><form ng-submit=\"saveMonthlyPackage()\"><br><div class=\"row\"><div class=\"col-md-4\"><div class=\"form-group\"><label>Credits</label><br><p class=\"form-control-static\">Unlimited</p></div></div><div class=\"col-md-4\"><div class=\"form-group\"><label>Price</label><br><input type=\"text\" class=\"form-control\" ng-model=\"monthlyPackage.price\"></div></div><div class=\"col-md-2\"><div class=\"form-group\"><label>&nbsp;</label><br><button type=\"submit\" class=\"btn btn-default\" ng-hide=\"savingMonthlyPackage\">Save</button> <button type=\"button\" class=\"btn btn-default\" ng-show=\"savingMonthlyPackage\">Saving...</button></div></div></div></form></div></div></div></div></div></div><br><br><br><br>");
$templateCache.put("app/settings/settings-payments.html","<div class=\"container-fluid no-padding\"><div class=\"container-fluid main-content\"><div class=\"row\"><div class=\"col-md-12\"><br><h3>Settings</h3><br><br><div ng-include=\"\'app/settings/navbar.html\'\"></div><br><br><br><br><div class=\"row\"><div class=\"col-md-8\"><div style=\"border-right: 1px solid #e2e2e2; padding-right: 40px\"><div ui-tree=\"\" callbacks=\"treeOptions\" id=\"tree-root\"><ol ui-tree-nodes=\"\" ng-model=\"paymentMethods\"><li ng-repeat=\"paymentMethod in paymentMethods\" ui-tree-node=\"\" ng-include=\"\'app/settings/payments.partial.html\'\"></li></ol></div><br><br><br><br><br></div></div><div class=\"col-md-4\"><div class=\"well\"><h4>Payment methods</h4><p>Select the payment methods you want to enable, drag-and-drop to save the order and edit credentials and details.</p></div></div></div></div><br><hr><br></div><br><br></div></div>");
$templateCache.put("app/settings/settings-properties.html","<div class=\"container-fluid no-padding\"><div class=\"container-fluid main-content\"><div class=\"row\"><div class=\"col-md-12\"><br><h3>Settings > properties</h3><br><br><div ng-include=\"\'app/settings/navbar.html\'\"></div><br><br><div class=\"row\"><div class=\"col-md-3\"><h4>Property categories</h4><p>Edit your store information. The store name shows up on your storefront, while the title and meta description help define how your store shows up on search engines.</p></div><div class=\"col-md-7 col-md-offset-1\"><table class=\"table\"><thead><tr><th>&nbsp;</th><th>Property type {{editPropertyTypeKey}}</th><th>Search criteria type</th></tr></thead><tbody><tr ng-repeat-start=\"(rowKey, propertyType) in propertyTypes | orderBy:\'position\':reverse\" ng-hide=\"editPropertyTypeKey == propertyType.id\"><td><a href=\"\" style=\"margin-right: 2px;\" ng-click=\"movePropertyType(rowKey, \'up\')\"><i class=\"fa fa-arrow-up\"></i></a><a href=\"\" ng-click=\"movePropertyType(rowKey, \'down\')\"><i class=\"fa fa-arrow-down\"></i></a></td><td><a href=\"\"><strong>{{propertyType.name}}</strong></a></td><td><a href=\"\"><strong>{{propertyType.search_criteria_type.name}}</strong></a></td><td><a href=\"\" ng-click=\"editPropertyType(propertyType.id)\">Edit</a> | <a href=\"\" ng-click=\"deletePropertyType(propertyType)\">Delete</a></td></tr><tr ng-repeat-end=\"(rowKey, propertyType) in propertyTypes | orderBy:\'position\':reverse\" ng-show=\"editPropertyTypeKey == propertyType.id\"><td><a href=\"\" style=\"margin-right: 2px;\" ng-click=\"movePropertyType(rowKey, \'up\')\"><i class=\"fa fa-arrow-up\"></i></a><a href=\"\" ng-click=\"movePropertyType(rowKey, \'down\')\"><i class=\"fa fa-arrow-down\"></i></a></td><td><input type=\"text\" ng-model=\"propertyTypeCopy.name\" class=\"form-control\"></td><td><select class=\"form-control\" ng-model=\"propertyTypeCopy.search_criteria_type_id\" ng-options=\"item.id as item.name for item in searchCriteriaTypes\"></select></td><td ng-hide=\"propertyTypeUpdating\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"updatePropertyType(propertyType, propertyTypeCopy)\">Update</button> | <a href=\"\" ng-click=\"cancelEditPropertyType(propertyType.id)\">Cancel</a></td><td ng-show=\"propertyTypeUpdating\"><button type=\"button\" class=\"btn btn-default\"><i class=\"fa fa-refresh fa-spin\"></i> Updating</button></td></tr></tbody></table><form ng-submit=\"addPropertyType()\"><br><br><div class=\"row\"><div class=\"col-md-5\"><div class=\"form-group\"><label>Property type</label><br><input type=\"text\" class=\"form-control\" ng-model=\"newPropertyType.name\"></div></div><div class=\"col-md-5\"><div class=\"form-group\"><label>Search criteria type</label><br><select class=\"form-control\" ng-model=\"newPropertyType.search_criteria_type_id\" ng-options=\"item.id as item.name for item in searchCriteriaTypes\"></select></div></div><div class=\"col-md-2\"><div class=\"form-group\"><label>&nbsp;</label><br><button type=\"submit\" class=\"btn btn-default\" ng-hide=\"savingPropertyType\">Add new</button> <button type=\"button\" class=\"btn btn-default\" ng-show=\"savingPropertyType\">Saving...</button></div></div></div></form></div></div><br><hr><br><div class=\"row\"><div class=\"col-md-3\"><h4>Search criteria types</h4><p>This address will appear on your invoices and will be used to calculate your shipping rates.</p></div><div class=\"col-md-7 col-md-offset-1\"><table class=\"table\"><thead><tr><th></th><th>Search criteria type</th></tr></thead><tbody><tr ng-repeat-start=\"(rowKey, searchCriteriaType) in searchCriteriaTypes | orderBy:\'position\':reverse\" ng-hide=\"editSearchCriteriaTypeKey == searchCriteriaType.id\"><td><a href=\"\" style=\"margin-right: 2px;\" ng-click=\"moveSearchCriteriaType(rowKey, \'up\')\"><i class=\"fa fa-arrow-up\"></i></a><a href=\"\" ng-click=\"moveSearchCriteriaType(rowKey, \'down\')\"><i class=\"fa fa-arrow-down\"></i></a></td><td><a href=\"\"><strong>{{searchCriteriaType.name}}</strong></a></td><td><a href=\"\" ng-click=\"editSearchCriteriaType(searchCriteriaType.id)\">Edit</a> | <a href=\"\" ng-click=\"deleteSearchCriteriaType(searchCriteriaType)\">Delete</a></td></tr><tr ng-repeat-end=\"(rowKey, searchCriteriaType) in searchCriteriaTypes | orderBy:\'position\':reverse\" ng-show=\"editSearchCriteriaTypeKey == searchCriteriaType.id\"><td><a href=\"\" style=\"margin-right: 2px;\" ng-click=\"moveSearchCriteriaType(rowKey, \'up\')\"><i class=\"fa fa-arrow-up\"></i></a><a href=\"\" ng-click=\"moveSearchCriteriaType(rowKey, \'down\')\"><i class=\"fa fa-arrow-down\"></i></a></td><td><select class=\"form-control\" ng-model=\"searchCriteriaTypeCopy.search_criteria_type_id\" ng-options=\"item.id as item.name for item in searchCriteriaTypes\"></select></td><td ng-hide=\"searchCriteriaTypeUpdating\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"updateSearchCriteriaType(searchCriteriaType, searchCriteriaTypeCopy)\">Update</button> | <a href=\"\" ng-click=\"cancelEditSearchCriteriaType(searchCriteriaType.id)\">Cancel</a></td><td ng-show=\"searchCriteriaTypeUpdating\"><button type=\"button\" class=\"btn btn-default\"><i class=\"fa fa-refresh fa-spin\"></i> Updating</button></td></tr></tbody></table><form ng-submit=\"addSearchCriteriaType()\"><br><br><div class=\"row\"><div class=\"col-md-5\"><div class=\"form-group\"><label>Add search criteria type</label><br><input type=\"text\" class=\"form-control\" ng-model=\"newSearchCriteriaType.name\" placeholder=\"\"></div></div><div class=\"col-md-2\"><div class=\"form-group\"><label>&nbsp;</label><br><button type=\"submit\" class=\"btn btn-default\" ng-hide=\"savingAddSearchCriteriaType\">Submit</button> <button type=\"button\" class=\"btn btn-default\" ng-show=\"savingAddSearchCriteriaType\">Saving...</button></div></div></div></form></div><br></div></div><br><br></div></div></div>");
$templateCache.put("app/settings/settings.html","<div class=\"container-fluid no-padding\"><div class=\"container-fluid main-content\"><div class=\"row\"><div class=\"col-md-12\"><br><h3>Settings</h3><br><br><div ng-include=\"\'app/settings/navbar.html\'\"></div><br><br><div class=\"row\"><div class=\"col-md-3\"><h4>Website information</h4><p>The website name shows up on your frontend. The title and meta description will be the default ones set for your home page.</p></div><div class=\"col-md-7 col-md-offset-1\"><div class=\"panel panel-default\"><div class=\"panel-body\"><form ng-submit=\"saveWebsiteDetails()\"><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label>Site name</label> <input type=\"text\" class=\"form-control\" ng-model=\"settings.website_name\"></div></div></div><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label>Description</label> <textarea class=\"form-control\" ng-model=\"settings.website_description\"></textarea></div></div></div><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label>Theme</label><select class=\"form-control\" ng-model=\"selectedTheme\" ng-options=\"theme.code as theme.value for theme in themes\"></select></div></div></div><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label>Logo</label><br><img ng-src=\"{{logoPath}}\" alt=\"Logo\" class=\"img-rounded\" style=\"max-width: 150px;\"><br><input type=\"file\" nv-file-select=\"\" uploader=\"uploader\"><p class=\"help-block\" ng-show=\"uploading\"><i class=\"fa fa-refresh fa-spin\"></i> uploading...</p><p class=\"help-block\" ng-hide=\"uploading\">Please make sure the logo is the right dimensions</p></div></div></div><button type=\"submit\" class=\"btn btn-default\">Submit</button></form></div></div></div></div><br><hr><br><div class=\"row\"><div class=\"col-md-3\"><h4>Company address</h4><p>This address will appear on your frontend contact section. Emails will all be sent to your contact email, while the support email will only be used in your support form.</p></div><div class=\"col-md-7 col-md-offset-1\"><div class=\"panel panel-default\"><div class=\"panel-body\"><form ng-submit=\"saveContactDetails()\"><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label>Company name</label> <input type=\"text\" class=\"form-control\" ng-model=\"settings.company_name\"></div></div></div><div class=\"row\"><div class=\"col-md-6\"><div class=\"form-group\"><label>Phone</label> <input type=\"text\" class=\"form-control\" ng-model=\"settings.phone\"></div></div><div class=\"col-md-6\"><div class=\"form-group\"><label>Fax</label> <input type=\"text\" class=\"form-control\" ng-model=\"settings.phone\"></div></div></div><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label>Address</label> <textarea class=\"form-control\" ng-model=\"settings.address\"></textarea></div></div></div><div class=\"row\"><div class=\"col-md-6\"><div class=\"form-group\"><label>Contact email</label> <input type=\"text\" class=\"form-control\" ng-model=\"settings.contact_email\"></div></div><div class=\"col-md-6\"><div class=\"form-group\"><label>Support email</label> <input type=\"text\" class=\"form-control\" ng-model=\"settings.support_email\"></div></div></div><div class=\"row\"><div class=\"col-md-6\"><div class=\"form-group\"><label>Latitude</label> <input type=\"text\" class=\"form-control\" ng-model=\"settings.company_latitude\"></div></div><div class=\"col-md-6\"><div class=\"form-group\"><label>Longitude</label> <input type=\"text\" class=\"form-control\" ng-model=\"settings.company_longitude\"></div></div></div><button type=\"submit\" class=\"btn btn-default\">Submit</button></form></div></div></div></div><br><hr><br><div class=\"row\"><div class=\"col-md-3\"><h4>Google Analytics</h4><p>Enter your google analytics code to track your website easily</p></div><div class=\"col-md-7 col-md-offset-1\"><div class=\"panel panel-default\"><div class=\"panel-body\"><form ng-submit=\"saveAnalyticsDetails()\"><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label>Analytics code</label> <textarea class=\"form-control\" ng-model=\"settings.analytics_code\"></textarea></div></div></div><button type=\"submit\" class=\"btn btn-default\">Submit</button></form></div></div></div></div><br><br><hr><br><div class=\"row\"><div class=\"col-md-3\"><h4>Default standards and formats</h4><p>Set up your preffered country, currency, date format, time zone and initial map locatioons</p></div><div class=\"col-md-7 col-md-offset-1\"><div class=\"panel panel-default\"><div class=\"panel-body\"><form ng-submit=\"saveStandardDetails()\"><div class=\"row\"><div class=\"col-md-6\"><div class=\"form-group\"><label>Timezone</label><select class=\"form-control\" ng-model=\"settings.timezone\" ng-options=\"timezone.value as timezone.text for timezone in timezones\"></select></div></div><div class=\"col-md-6\"><div class=\"form-group\"><label>Currency</label><select class=\"form-control\" ng-model=\"settings.default_currency\" ng-options=\"currency.code as currency.name for currency in currencies\"></select></div></div><div class=\"col-md-6\"><div class=\"form-group\"><label>Default country</label><select class=\"form-control\" ng-model=\"settings.default_country\" ng-options=\"country.code as country.name for country in countries\"></select></div></div></div><hr><div class=\"row\"><div class=\"col-md-12\"><p class=\"muted\">The position of your map originally</p></div><div class=\"col-md-6\"><div class=\"form-group\"><label>Initial map latitude</label> <input type=\"text\" class=\"form-control\" ng-model=\"settings.initial_lat\"></div></div><div class=\"col-md-6\"><div class=\"form-group\"><label>Initial map longitude</label> <input type=\"text\" class=\"form-control\" ng-model=\"settings.initial_lng\"></div></div><div class=\"col-md-6\"><div class=\"form-group\"><label>Initial map zoom</label> <input type=\"text\" class=\"form-control\" ng-model=\"settings.initial_zoom\"></div></div></div><div class=\"row\"><div class=\"col-md-12\"><button type=\"submit\" class=\"btn btn-default\">Submit</button></div></div></form></div></div></div></div></div></div><br></div></div><br><br>");
$templateCache.put("components/navbar/navbar.html","<nav class=\"navbar navbar-default navbar-top navbar-fixed-top\" role=\"navigation\"><div class=\"container-fluid max-width\"><div class=\"navbar-header\"><button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#navbar\" aria-expanded=\"false\" aria-controls=\"navbar\"><span class=\"sr-only\">Toggle navigation</span> <span class=\"icon-bar\"></span> <span class=\"icon-bar\"></span> <span class=\"icon-bar\"></span></button> <a class=\"navbar-brand\" ui-sref=\"app.properties.index\">esatezilla</a> <a href=\"{{API_URL}}\" class=\"open-website\"><i class=\"fa fa-external-link\"></i></a></div><div id=\"navbar\" class=\"navbar-collapse collapse\"><ul class=\"nav navbar-nav\"><li ng-show=\"user.permissions.indexOf(\'properties\') > -1\"><a ui-sref=\"app.properties.index\">Properties</a></li><li ng-show=\"user.permissions.indexOf(\'pages\') > -1\"><a ui-sref=\"app.pages.index\">Pages</a></li><li ng-show=\"user.permissions.indexOf(\'pages\') > -1\"><a ui-sref=\"app.regions.index\">Snippets</a></li><li ng-show=\"user.permissions.indexOf(\'navigation\') > -1\"><a ui-sref=\"app.navigation.index\">Navigation</a></li><li ng-show=\"user.permissions.indexOf(\'members\') > -1\"><a ui-sref=\"app.members.index\">Members</a></li></ul><ul class=\"nav navbar-nav navbar-right hidden-xs\"><li class=\"hidden-sm\"><a ui-sref=\"app.main.index\">Logged in as <strong>{{user.username}}</strong></a></li><li><a ui-sref=\"app.settings.index\"><i class=\"fa fa-cog\"></i></a></li><li><a href=\"\" ng-click=\"signOut()\"><i class=\"fa fa-power-off\"></i></a></li></ul></div></div></nav>");
$templateCache.put("components/sidebar/sidebar.html","<div id=\"sidebar-wrapper\"><ul class=\"sidebar-nav menu\"><li><a>&nbsp;</a></li><li><a ui-sref=\"app.dashboard.index\" class=\"active\"><span><i class=\"fa fa-desktop\"></i></span> Dashboard</a></li><li ng-show=\"user.permissions.indexOf(\'properties\') > -1\"><a ui-sref=\"app.properties.index\"><span><i class=\"fa fa-building\"></i></span> Properties</a></li><li ng-show=\"user.permissions.indexOf(\'members\') > -1\"><a ui-sref=\"app.members.index\"><span><i class=\"fa fa-users\"></i></span> Members</a></li><li class=\"divider-vertical\"></li><li ng-show=\"user.permissions.indexOf(\'pages\') > -1\"><a ui-sref=\"app.pages.index\"><span><i class=\"fa fa-file-text-o\"></i></span> Pages</a></li><li ng-show=\"user.permissions.indexOf(\'navigation\') > -1\"><a ui-sref=\"app.navigation.index\"><span><i class=\"fa fa-sitemap\"></i></span> Navigation</a></li><li ng-show=\"user.permissions.indexOf(\'languages\') > -1\"><a ui-sref=\"app.languages.index\"><span><i class=\"fa fa-language\"></i></span> Languages</a></li><li class=\"divider-vertical\"></li><li ng-show=\"user.permissions.indexOf(\'transactions\') > -1\"><a ui-sref=\"app.transactions.index\"><span><i class=\"fa fa-comments-o\"></i></span> Transactions</a></li><li ng-show=\"user.permissions.indexOf(\'settings\') > -1\"><a ui-sref=\"app.settings.index\"><span><i class=\"fa fa-cogs\"></i></span> Settings</a></li></ul></div>");
$templateCache.put("app/members/blocks/admin-access.html","<div class=\"row\"><div class=\"col-md-6\" ng-repeat=\"permissionName in permissions\"><div class=\"checkbox\" style=\"margin-top: 0px; text-transform: capitalize;\"><label><input type=\"checkbox\" name=\"selectedPermissions[]\" value=\"{{permissionName}}\" ng-checked=\"member.admin_permissions.indexOf(permissionName) > -1\" ng-click=\"toggleSelection(permissionName)\"> {{permissionName}}</label></div></div></div>");
$templateCache.put("app/members/blocks/edit-member.html","<div class=\"row\"><div class=\"col-md-3\"><div class=\"form-group\"><label>Salutation</label><select ng-model=\"member.gender\" class=\"form-control\"><option value=\"male\">Mr</option><option value=\"female\">Mrs</option></select></div></div><div class=\"col-md-4\"><div class=\"form-group\"><label>First name</label> <input type=\"text\" name=\"firstname\" ng-model=\"member.firstname\" class=\"form-control\" server-error=\"\"> <span ng-show=\"form.firstname.$error.server\">{{errors.firstname}}</span><div ng-messages=\"form.firstname.$error\" ng-if=\"form.$submitted\" ng-messages-include=\"my-messages\"></div></div></div><div class=\"col-md-5\"><div class=\"form-group\"><label>Last name</label> <input type=\"text\" name=\"lastname\" ng-model=\"member.lastname\" class=\"form-control\" server-error=\"\"> <span ng-show=\"form.lastname.$error.server\">{{errors.lastname}}</span></div></div></div><div class=\"row\"><div class=\"col-md-6\"><div class=\"form-group\"><label>Username</label> <input type=\"text\" ng-model=\"member.username\" class=\"form-control\"></div></div><div class=\"col-md-6\"><div class=\"form-group\"><label>Email address</label><div class=\"input-group\"><div class=\"input-group-addon\"><i class=\"fa fa-envelope\"></i></div><input type=\"text\" ng-model=\"member.email\" class=\"form-control\"></div></div></div></div><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label>Phone</label><div class=\"input-group\"><div class=\"input-group-addon\"><i class=\"fa fa-phone\"></i></div><input type=\"text\" ng-model=\"member.phone\" class=\"form-control\"></div></div></div></div><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label>Mobile</label><div class=\"input-group\"><div class=\"input-group-addon\"><i class=\"fa fa-mobile\"></i></div><input type=\"text\" ng-model=\"member.mobile\" class=\"form-control\"></div></div></div></div><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label>Fax</label><div class=\"input-group\"><div class=\"input-group-addon\"><i class=\"fa fa-fax\"></i></div><input type=\"text\" ng-model=\"member.fax\" class=\"form-control\"></div></div></div></div><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label>Website</label><div class=\"input-group\"><div class=\"input-group-addon\"><i class=\"fa fa-globe\"></i></div><input type=\"text\" ng-model=\"member.website\" class=\"form-control\"></div></div></div></div><div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label>About</label> <textarea class=\"form-control\" ng-model=\"member.about\" rows=\"6\"></textarea></div></div></div><div class=\"row\" ng-show=\"!changePassword\"><div class=\"col-md-12\"><div class=\"form-group\"><label>Password</label><div class=\"row\"><div class=\"col-md-6\"><input type=\"text\" disabled=\"\" value=\"XXXXXXXXX\" class=\"form-control\"></div><div class=\"col-md-6\"><p class=\"form-control-static\"><a href=\"\" ng-click=\"changePassword = true\">Change password</a></p></div></div></div></div></div><div class=\"row\" ng-show=\"changePassword\"><div class=\"col-md-6\"><div class=\"form-group\"><label>New password</label> <input type=\"password\" ng-model=\"member.password\" class=\"form-control\"></div></div><div class=\"col-md-6\"><div class=\"form-group\"><label>Confirm new password</label> <input type=\"password\" ng-model=\"member.password_confirmation\" class=\"form-control\"></div></div></div>");
$templateCache.put("app/members/blocks/login-history.html","<table class=\"table\"><thead><tr><th>Date</th><th>IP</th><th>ISP</th><th>Location</th></tr></thead><tbody><tr><td>Today at 5:31am</td><td>77.102.88.85</td><td>Virgin Media</td><td>London, H9, United Kingdom</td></tr><tr><td>Today at 5:31am</td><td>77.102.88.85</td><td>Virgin Media</td><td>London, H9, United Kingdom</td></tr><tr><td>Today at 5:31am</td><td>77.102.88.85</td><td>Virgin Media</td><td>London, H9, United Kingdom</td></tr><tr><td>Today at 5:31am</td><td>77.102.88.85</td><td>Virgin Media</td><td>London, H9, United Kingdom</td></tr></tbody></table>");
$templateCache.put("app/members/blocks/member-remarks.html","<div class=\"row\"><div class=\"col-md-12\"><div class=\"form-group\"><label>Notes</label> <textarea class=\"form-control\" ng-model=\"member.notes\" rows=\"5\"></textarea></div></div></div>");
$templateCache.put("app/members/blocks/member-roles.html","<div class=\"form-horizontal\"><div class=\"panel panel-default\"><div class=\"panel-heading\">Member Roles</div><div class=\"panel-body\"><div class=\"col-sm-12\"><div class=\"form-group\"><label>Member type</label><select ng-model=\"member.is_admin\" class=\"form-control\" ng-options=\"o.v as o.n for o in [{ n: \'Adminstrator\', v: true }, { n: \'Regular user\', v: false }]\"></select></div><div class=\"form-group\"><div class=\"checkbox\"><label><input type=\"checkbox\" ng-model=\"member.is_advertiser\"> Estate agent/advertiser</label></div><div class=\"checkbox\"><label><input type=\"checkbox\" ng-model=\"member.is_seller\"> Non-professional seller/landlord</label></div><div class=\"checkbox\"><label><input type=\"checkbox\" ng-model=\"member.is_prospect\"> Prospective buyer</label></div></div></div></div></div></div>");
$templateCache.put("app/members/blocks/saved-properties.html","<table class=\"table\"><thead><tr><th>Date</th><th>IP</th><th>ISP</th><th>Location</th></tr></thead><tbody><tr><td>Today at 5:31am</td><td>77.102.88.85</td><td>Virgin Media</td><td>London, H9, United Kingdom</td></tr><tr><td>Today at 5:31am</td><td>77.102.88.85</td><td>Virgin Media</td><td>London, H9, United Kingdom</td></tr><tr><td>Today at 5:31am</td><td>77.102.88.85</td><td>Virgin Media</td><td>London, H9, United Kingdom</td></tr><tr><td>Today at 5:31am</td><td>77.102.88.85</td><td>Virgin Media</td><td>London, H9, United Kingdom</td></tr></tbody></table>");
$templateCache.put("app/members/blocks/saved-searches.html","<table class=\"table\"><thead><tr><th>Date</th><th>IP</th><th>ISP</th><th>Location</th></tr></thead><tbody><tr><td>Today at 5:31am</td><td>77.102.88.85</td><td>Virgin Media</td><td>London, H9, United Kingdom</td></tr><tr><td>Today at 5:31am</td><td>77.102.88.85</td><td>Virgin Media</td><td>London, H9, United Kingdom</td></tr><tr><td>Today at 5:31am</td><td>77.102.88.85</td><td>Virgin Media</td><td>London, H9, United Kingdom</td></tr><tr><td>Today at 5:31am</td><td>77.102.88.85</td><td>Virgin Media</td><td>London, H9, United Kingdom</td></tr></tbody></table>");
$templateCache.put("app/members/blocks/your-properties.html","<table class=\"table\"><thead><tr><th>Date</th><th>IP</th><th>ISP</th><th>Location</th></tr></thead><tbody><tr><td>Today at 5:31am</td><td>77.102.88.85</td><td>Virgin Media</td><td>London, H9, United Kingdom</td></tr><tr><td>Today at 5:31am</td><td>77.102.88.85</td><td>Virgin Media</td><td>London, H9, United Kingdom</td></tr><tr><td>Today at 5:31am</td><td>77.102.88.85</td><td>Virgin Media</td><td>London, H9, United Kingdom</td></tr><tr><td>Today at 5:31am</td><td>77.102.88.85</td><td>Virgin Media</td><td>London, H9, United Kingdom</td></tr></tbody></table>");
$templateCache.put("app/properties/forms/address.html","<form name=\"form\" ng-submit=\"submitForm(form.$valid)\" novalidate=\"\" qn:validate=\"errors\" autocomplete=\"off\"><input autocomplete=\"false\" name=\"hidden\" type=\"text\" style=\"display:none;\"><div class=\"panel panel-default\"><div class=\"panel-heading\"><i class=\"fa fa-chevron-right\"></i> Property address</div><div class=\"panel-body\"><div class=\"row\"><div class=\"col-sm-6\"><style>\n                        #map {\n                            border: 1px solid #DDD;\n                            width:100%;\n                            height: 300px;\n                            margin: 10px 0 10px 0;\n                            -webkit-box-shadow: #AAA 0px 0px 15px;\n                        }\n                    </style><div class=\"row\"><div class=\"col-xs-12\" style=\"margin-bottom: 11px\"><label>Type in the address</label> <input type=\"text\" class=\"form-control\" id=\"addresspicker_map\" ng-model=\"property.displayable_address\" autocomplete=\"false\" spellcheck=\"false\"></div><div class=\"col-xs-4\" style=\"margin-bottom: 11px\"><label>Street no.</label> <input type=\"text\" class=\"form-control\" id=\"street_no\" ng-model=\"property.street_no\"></div><div class=\"col-xs-8\" style=\"margin-bottom: 11px\"><label>Street name</label> <input type=\"text\" class=\"form-control\" id=\"street_name\" ng-model=\"property.street_name\"></div><div class=\"col-xs-12\" style=\"margin-bottom: 11px\"><label>Town/City</label> <input type=\"text\" class=\"form-control\" id=\"city\" ng-model=\"property.city\"></div><div class=\"col-xs-8\" style=\"margin-bottom: 11px\"><label>State/Province/Region</label> <input type=\"text\" class=\"form-control\" id=\"region\" ng-model=\"property.region\"></div><div class=\"col-xs-4\" style=\"margin-bottom: 11px\"><label>Postcode/ZIP</label> <input type=\"text\" class=\"form-control\" id=\"postcode\" ng-model=\"property.postcode\"></div><div class=\"col-xs-12\" style=\"margin-bottom: 11px\"><label>Country</label> <input type=\"text\" class=\"form-control\" id=\"country\" ng-model=\"property.country\"> <input type=\"text\" class=\"form-control\" id=\"lat\" ng-model=\"property.lat\" style=\"display: none\"> <input type=\"text\" class=\"form-control\" id=\"lng\" ng-model=\"property.lng\" style=\"display: none\"></div></div><br></div><div class=\"col-sm-6\"><div class=\"map-ad-wrapper\" style=\"min-height: 300px\"><div id=\"map\"></div><div id=\"legend\">Drag and drop the marker to the correct location</div></div></div></div></div><div class=\"panel-footer\"><div class=\"row\"><div class=\"col-xs-12\"><button type=\"submit\" class=\"btn btn-primary pull-right\">Save</button></div></div></div></div></form>");
$templateCache.put("app/properties/forms/description.html","<form name=\"form\" ng-submit=\"submitForm(form.$valid)\" novalidate=\"\" qn:validate=\"errors\"><div class=\"panel panel-default\"><div class=\"panel-heading\"><i class=\"fa fa-chevron-right\"></i> Property description</div><div class=\"panel-body\"><div class=\"row\"><div class=\"col-sm-12\"><div class=\"form-group\"><label>Listing title #{{property.id}}</label> <input type=\"text\" class=\"form-control\" ng-model=\"translation.title\" placeholder=\"\"></div></div></div><div class=\"form-group\"><label>Summary</label> <textarea class=\"form-control\" cols=\"20\" rows=\"3\" ng-model=\"translation.summary\"></textarea></div><div class=\"form-group\"><label>Description</label> <textarea class=\"form-control\" ckeditor=\"editorOptions\" ng-model=\"translation.description\"></textarea></div></div><div class=\"panel-footer\"><div class=\"row\"><div class=\"col-xs-12\"><button type=\"submit\" ng-hide=\"saving\" class=\"btn btn-primary pull-right\">Save</button> <button type=\"button\" ng-show=\"saving\" class=\"btn btn-primary pull-right\">Saving...</button></div></div></div></div></form>");
$templateCache.put("app/properties/forms/features.html","<form name=\"form\" ng-submit=\"submitForm(form.$valid)\" novalidate=\"\" qn:validate=\"errors\"><div class=\"panel panel-default\"><div class=\"panel-heading\"><i class=\"fa fa-chevron-right\"></i> Property features</div><div class=\"panel-body\"><div class=\"row\"><div class=\"col-xs-3\" ng-repeat=\"feature in features\"><label>Feature #{{$index+1}}</label> <input type=\"text\" class=\"form-control\" placeholder=\"\" ng-model=\"feature.value\"></div></div></div><div class=\"panel-footer\"><div class=\"row\"><div class=\"col-xs-12\"><button type=\"submit\" ng-hide=\"saving\" class=\"btn btn-primary pull-right\">Save</button> <button type=\"button\" ng-show=\"saving\" class=\"btn btn-primary pull-right\">Saving...</button></div></div></div></div></form>");
$templateCache.put("app/properties/forms/general.html","<form name=\"form\" ng-submit=\"submitForm(form.$valid)\" novalidate=\"\" qn:validate=\"errors\"><div class=\"panel panel-default\"><div class=\"panel-heading\"><i class=\"fa fa-chevron-right\"></i> General</div><div class=\"panel-body\"><div class=\"row\"><div class=\"col-sm-3\"><label>Listing type</label><select class=\"form-control\" ng-model=\"property.listing_type\"><option value=\"sale\">Sale</option><option value=\"rent\">Rent</option></select></div><div class=\"col-sm-3\"><label>Listing status</label><select class=\"form-control\" ng-model=\"property.listing_status\"><option value=\"for_sale\">For sale</option><option value=\"sale_under_offer\">Sale under offer</option><option value=\"sold\">Sold</option><option value=\"to_rent\">To rent</option><option value=\"rent_under_offer\">Rent under offer</option><option value=\"rented\">Rented</option></select></div><div class=\"col-sm-3\"><label>Property type</label><select class=\"form-control\" ng-model=\"property.property_type_id\" ng-options=\"propertyType.id as propertyType.name for propertyType in propertyTypes\"></select></div><div class=\"col-sm-3\"><label>Submitted by (user)</label> <span ng-show=\"spinnerPage\" class=\"pull-right\" style=\"margin-right: 5px;\"><i class=\"fa fa-refresh fa-spin\"></i></span> <input type=\"hidden\" class=\"form-control\" ng-model=\"property.user_id\"><ui-select ng-model=\"selectedUser.selected\" theme=\"bootstrap\" ng-change=\"updateUserLink()\" ng-show=\"true\"><ui-select-match placeholder=\"{{property.email}}\">{{$select.selected.email}}</ui-select-match><ui-select-choices refresh=\"searchUsers($select)\" refresh-delay=\"300\" repeat=\"user in userList\"><span ng-bind-html=\"user.email | highlight: $select.search\"></span></ui-select-choices></ui-select></div></div><br><div class=\"row\"><div class=\"col-sm-3\"><label>Available from</label><div class=\"dropdown\"><a class=\"dropdown-toggle\" id=\"available_from\" role=\"button\" data-toggle=\"dropdown\" href=\"\" ng-click=\"setToday()\"><div class=\"input-group\"><input type=\"text\" class=\"form-control\" ng-model=\"property.available_from\" data-date-time-input=\"YYYY-MM-DD\"><span class=\"input-group-addon\"><i class=\"fa fa-calendar\"></i></span></div></a><ul class=\"dropdown-menu\" role=\"menu\" aria-labelledby=\"dLabel\"><datetimepicker data-ng-model=\"property.available_from\" data-date-time-input=\"YYYY-MM-DD\" data-datetimepicker-config=\"{ dropdownSelector: \'#available_from\', startView:\'day\', minView:\'day\' }\"></datetimepicker></ul></div></div><div class=\"col-sm-3\"><label>Expires on</label><div class=\"dropdown\"><a class=\"dropdown-toggle\" id=\"expires_at\" role=\"button\" data-toggle=\"dropdown\" href=\"\" ng-click=\"setToday()\"><div class=\"input-group\"><input type=\"text\" class=\"form-control\" ng-model=\"property.expires_at\" data-date-time-input=\"YYYY-MM-DD\"><span class=\"input-group-addon\"><i class=\"fa fa-calendar\"></i></span></div></a><ul class=\"dropdown-menu\" role=\"menu\" aria-labelledby=\"dLabel\"><datetimepicker data-ng-model=\"property.expires_at\" data-date-time-input=\"YYYY-MM-DD\" data-datetimepicker-config=\"{ dropdownSelector: \'#expires_at\', startView:\'day\', minView:\'day\' }\"></datetimepicker></ul></div></div><div class=\"col-sm-3\"><label>Condition of property</label><select class=\"form-control\" ng-model=\"property.property_condition\"><option value=\"not_specified\">Not specified</option><option value=\"new\">New</option><option value=\"pre_owned\">Pre-owned</option></select></div><div class=\"col-sm-3\"><label>Property size</label><div class=\"input-group\"><input type=\"text\" class=\"form-control\" ng-model=\"property.property_size\"> <span class=\"input-group-addon\">m<sup>2</sup></span></div></div></div><br><div class=\"row\"><div class=\"col-sm-3\"><label>Bedrooms</label> <input type=\"text\" class=\"form-control\" ng-model=\"property.num_bedrooms\"></div><div class=\"col-sm-3\"><label>Bathrooms</label> <input type=\"text\" class=\"form-control\" ng-model=\"property.num_bathrooms\"></div><div class=\"col-sm-3\"><label>Outside space</label><br><label class=\"checkbox-inline\"><input type=\"checkbox\" name=\"has_garden\" ng-model=\"property.has_garden\" ng-true-value=\"1\" ng-false-value=\"0\"> Garden</label> <label class=\"checkbox-inline\"><input type=\"checkbox\" name=\"has_parking\" ng-model=\"property.has_parking\" ng-true-value=\"1\" ng-false-value=\"0\"> Parking</label></div><div class=\"col-sm-3\"><label>Investment property</label><br><label class=\"radio-inline\"><input type=\"radio\" name=\"is_investment_property\" ng-model=\"property.is_investment_property\" value=\"1\"> Yes</label> <label class=\"radio-inline\"><input type=\"radio\" name=\"is_investment_property\" ng-model=\"property.is_investment_property\" value=\"0\"> No</label></div></div><br><div class=\"row\"><div class=\"col-sm-3\"><label>&nbsp;</label> <label class=\"checkbox-inline\"><input type=\"checkbox\" name=\"is_featured\" ng-model=\"property.is_featured\" ng-true-value=\"1\" ng-false-value=\"0\"> Featured</label></div></div></div><div class=\"panel-footer\"><div class=\"row\"><div class=\"col-xs-12\"><button type=\"submit\" ng-hide=\"saving\" class=\"btn btn-primary pull-right\">Save</button> <button type=\"button\" ng-show=\"saving\" class=\"btn btn-primary pull-right\">Saving...</button></div></div></div></div></form>");
$templateCache.put("app/properties/forms/images.html","<div class=\"panel panel-default upload-panel\"><div class=\"panel-heading\"><i class=\"fa fa-chevron-right\"></i> Images and documents</div><div class=\"panel-body\"><div class=\"row\"><div class=\"col-xs-12\"><ul class=\"nav nav-tabs\"><li role=\"presentation\" ng-class=\"{active: imageType == \'photos\'}\"><a href=\"\" ng-click=\"imageType = \'photos\'\">Property photos</a></li><li role=\"presentation\" ng-class=\"{active: imageType == \'floor_plans\'}\"><a href=\"\" ng-click=\"imageType = \'floor_plans\'\">Floor plans</a></li><li role=\"presentation\" ng-class=\"{active: imageType == \'documents\'}\"><a href=\"\" ng-click=\"imageType = \'documents\'\">Documents</a></li><li role=\"presentation\" ng-class=\"{active: imageType == \'virtual_tours\'}\"><a href=\"\" ng-click=\"imageType = \'virtual_tours\'\">Virtual tours</a></li></ul><div id=\"my-dropzone\" class=\"dropzone\" style=\"background: #fcfcfc; border: #e2e2e2 1px solid; border-top: 0;width: 100%; min-height: 350px; display: block; padding: 20px\"><div class=\"row\"><div class=\"col-xs-6 col-md-4 col-lg-3\" ng-if=\"uploader\" ng-hide=\"imageType == \'virtual_tours\'\"><div class=\"panel panel-default add-image-panel\" nv-file-over=\"\" uploader=\"uploader\" ng-hide=\"uploading\"><div class=\"panel-body\"><br><div ng-hide=\"uploading_init\"><i class=\"fa fa-check success-color\" style=\"font-size: 40px;\" ng-hide=\"uploading_error\"></i><p ng-hide=\"uploading_error\">Succcessfully uploaded!</p><i class=\"fa fa-times error-color\" style=\"font-size: 40px;\" ng-show=\"uploading_error\"></i><p ng-show=\"uploading_error\">There was an error while uploading.</p><br><button class=\"btn btn-primary\" type=\"button\" ng-click=\"clickUpload()\" ng-hide=\"uploading_error\">Upload files</button> <button class=\"btn btn-primary\" type=\"button\" ng-click=\"clickUpload()\" ng-show=\"uploading_error\">Try again</button></div><div ng-show=\"uploading_init\"><i class=\"fa fa-picture-o\" style=\"font-size: 40px;\"></i> <input type=\"file\" id=\"imageUpload\" style=\"display: none;\" nv-file-select=\"\" uploader=\"uploader\" multiple=\"\"><p>Drop files here</p><p>or</p><button class=\"btn btn-primary\" type=\"button\" ng-click=\"clickUpload()\">Select files</button><ul ng-if=\"false\"><li ng-repeat=\"item in uploader.queue\">Name: <span ng-bind=\"item.file.name\"></span><br><button ng-click=\"item.upload()\">upload</button></li></ul></div></div></div><div class=\"panel panel-default add-image-panel\" ng-show=\"uploading\"><div class=\"panel-body\"><br><i class=\"fa fa-circle-o-notch fa-spin\" style=\"font-size: 40px;\"></i><p>Uploading...</p></div></div></div><div class=\"col-xs-6 col-md-4 col-lg-3\" ng-repeat=\"image in property[imageType] track by $index\" ng-hide=\"imageType == \'virtual_tours\'\"><div class=\"panel panel-default image-panel\"><div class=\"panel-body\"><a class=\"close_ico\" href=\"\" ng-click=\"deleteImage(imageType, image.file)\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Click to remove\"></a> <img class=\"thumbnail\" ng-src=\"{{getThumbnail(property.id, imageType, image.file)}}\" style=\"width: 100%\"><div class=\"uneditable\"><div class=\"row\"><div class=\"col-md-12\"><span editable-text=\"image.caption\" e-form=\"textBtnForm\" onbeforesave=\"updateCaption(image, $data)\">{{image.caption | characters:20}}</span> <a href=\"\" ng-click=\"textBtnForm.$show()\" ng-hide=\"textBtnForm.$visible\">(Edit)</a></div></div></div></div></div></div><div class=\"col-xs-12\" ng-show=\"imageType == \'virtual_tours\'\"><div class=\"panel panel-default image-panel\"><div class=\"panel-body\"><form name=\"form\" ng-submit=\"submitVirtualTours(form.$valid)\" novalidate=\"\" qn:validate=\"errors\"><table class=\"table table-condensed\"><thead><tr><th>#</th><th>Virtual tour file URL</th><th>Caption</th></tr></thead><tbody><tr ng-repeat=\"image in translation[imageType] track by $index\"><th scope=\"row\">{{$index+1}}</th><td><input type=\"text\" class=\"form-control\" ng-model=\"image.url\"></td><td><input type=\"text\" class=\"form-control\" ng-model=\"image.caption\"></td><td><a href=\"\" ng-click=\"addVirtualTour()\" class=\"btn btn-default\" ng-show=\"$last\"><i class=\"fa fa-plus\"></i></a></td></tr></tbody></table></form></div></div></div></div></div></div></div></div><div class=\"panel-footer\"><div class=\"row\"><div class=\"col-xs-12\"><button type=\"button\" ng-click=\"submitVirtualTours(form.$valid)\" ng-disabled=\"saveDisabled\" ng-class=\"{disabled:save}\" class=\"btn btn-primary pull-right\">Save</button></div></div></div></div>");
$templateCache.put("app/properties/forms/pricing.html","<form name=\"form\" ng-submit=\"submitForm(form.$valid)\" novalidate=\"\" qn:validate=\"errors\"><div class=\"panel panel-default\"><div class=\"panel-heading\"><i class=\"fa fa-chevron-right\"></i> Pricing</div><div class=\"panel-body\"><div class=\"row\"><div class=\"col-sm-4\"><label>Price</label><div class=\"input-group\"><input type=\"text\" class=\"form-control\" ng-model=\"property.price\" pattern=\"[0-9]+([\\.,][0-9]+)*\" format-price=\"\"> <span class=\"input-group-addon\">{{settings.default_currency}}</span></div></div><div class=\"col-sm-4\"><label>Reduced price</label><div class=\"input-group\"><input type=\"text\" class=\"form-control\" ng-model=\"property.reduced_price\" pattern=\"[0-9]+([\\.,][0-9]+)*\" format-price=\"\"> <span class=\"input-group-addon\">{{settings.default_currency}}</span></div></div><div class=\"col-sm-4\"><label>Price options</label><br><label class=\"checkbox-inline\"><input type=\"checkbox\" name=\"has_garden\" ng-model=\"property.negotiable_price\" ng-true-value=\"1\" ng-false-value=\"0\"> Negotiable</label> <label class=\"checkbox-inline\"><input type=\"checkbox\" name=\"has_parking\" ng-model=\"property.poa\" ng-true-value=\"1\" ng-false-value=\"0\"> POA</label></div></div><br><div class=\"row\"><div class=\"col-sm-3\"><label>Period</label><br><select class=\"form-control\" ng-model=\"property.price_period\"><option value=\"\">-- SELECT --</option><option value=\"per_night\">per night</option><option value=\"per_week\">per week</option><option value=\"per_month\">per month</option></select></div><div class=\"col-sm-3\"><label>&nbsp;</label><br><select class=\"form-control\" ng-model=\"property.price_type\"><option value=\"\">-- SELECT --</option><option value=\"per_room\">per room</option><option value=\"per_person\">per person</option></select></div></div></div><div class=\"panel-footer\"><div class=\"row\"><div class=\"col-xs-12\"><button type=\"submit\" ng-hide=\"saving\" class=\"btn btn-primary pull-right\">Save</button> <button type=\"button\" ng-show=\"saving\" class=\"btn btn-primary pull-right\">Saving...</button></div></div></div></div></form>");}]);