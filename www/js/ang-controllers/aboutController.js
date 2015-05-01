angular.module("angControllers").controller("aboutController",
    ['$scope', '$state','user', 
    function($scope, $state, user) {
        $scope.screenToShow = "terms";
        $scope.language = "en"; 
}]);
    