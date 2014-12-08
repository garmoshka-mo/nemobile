angular.module("angControllers").controller("exitController", ['$rootScope','$scope', '$state','api', function($rootScope, $scope, $state, api) {
    $scope.exit = function() {
        // api.saveUserInLS();
        api.unsubscribe();
        $state.go('start');
    }
}])
    