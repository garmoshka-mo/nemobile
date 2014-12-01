angular.module("angControllers").controller("loginController", ['$rootScope','$scope', '$state','api', function($rootScope, $scope, $state, api) {
    $scope.exit = function() {
        api.saveUserInLS();
        $state.go('signin');
    }
}])
    