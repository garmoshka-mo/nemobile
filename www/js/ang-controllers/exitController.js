angular.module("angControllers").controller("exitController", ['$rootScope','$scope', '$state','api', 'storage', function($rootScope, $scope, $state, api, storage) {
    $scope.exit = function() {
        // api.saveUserInLS();
        api.unsubscribe();
        storage.clear();
        $state.go('start');
    }
}])
    