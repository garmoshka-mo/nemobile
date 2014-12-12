angular.module("angControllers").controller("exitController", ['$rootScope','$scope', '$state','api', function($rootScope, $scope, $state, api) {
    $scope.exit = function() {
        // api.saveUserInLS();
        api.unsubscribe();
        localStorage.setItem('isLogged', false);
        $state.go('start');
    }
}])
    