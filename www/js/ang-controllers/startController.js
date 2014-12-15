angular.module("angControllers").controller("startController", function($rootScope, $scope, $state, storage) {
    if ($scope.isLogged()) {
      $state.go('chats');
    }
    else {
      $state.go('start');
    }
})