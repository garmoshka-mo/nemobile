angular.module("angControllers").controller("randomController", [
         'user', '$scope',
    function(user, $scope) {
       $scope.opened = true;
    }
]);
