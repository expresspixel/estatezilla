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
