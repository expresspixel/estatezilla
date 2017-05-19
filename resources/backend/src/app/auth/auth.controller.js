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
