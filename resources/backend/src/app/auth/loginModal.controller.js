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