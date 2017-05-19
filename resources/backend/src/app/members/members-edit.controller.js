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
