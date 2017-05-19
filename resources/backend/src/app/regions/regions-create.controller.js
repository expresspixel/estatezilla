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
