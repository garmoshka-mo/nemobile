angular.module("angControllers").controller("exitController", ['$scope', '$state','user', 'storage', function($scope, $state, user, storage) {
    $scope.exit = function() {
        // api.saveUserInLS();
        user.unsubscribe();
        user.clear();
        storage.clear();
        $state.go('start');
    }
}])
    