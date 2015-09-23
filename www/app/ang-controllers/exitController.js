angular.module("angControllers").controller("exitController",
    ['$scope','user',
function($scope, user) {
    $scope.showSpinner = false;

    $scope.exit = function() {
        $scope.showSpinner = true;
        user.logoutAndGoHome();
    };
}]);
    