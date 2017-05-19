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

