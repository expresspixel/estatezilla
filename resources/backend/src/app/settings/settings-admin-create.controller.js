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
