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


