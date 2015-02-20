angular.module("angControllers").controller("exitController", ['$scope', '$state','user', 'storage', function($scope, $state, user, storage) {
    $scope.exit = function() {
        user.logout();
        $state.go('start');
    };
}]);
    