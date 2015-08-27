angular.module("angControllers").controller("exitController", ['$scope', '$state','user', 'storage', function($scope, $state, user, storage) {
    $scope.showSpinner = false;

    $scope.exit = function() {
        $scope.showSpinner = true;
        user.logout()
        .then(function() {
            $state.go('homepage');
        });
    };
}]);
    