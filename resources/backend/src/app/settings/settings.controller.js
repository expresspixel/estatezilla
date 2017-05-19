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
