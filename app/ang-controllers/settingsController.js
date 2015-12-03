angular.module("angControllers").controller("settingsController", [
    'user', '$scope',
    function(user, $scope) {
        $scope.user = user;
}])