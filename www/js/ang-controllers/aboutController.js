angular.module("angControllers").controller("aboutController",
    ['$scope', '$state','user', '$stateParams', '$state', 
    function($scope, $state, user, $stateParams, $state) {
        if ($stateParams.page) {
            $scope.screenToShow = $stateParams.page;
        }
        else {
            $scope.screenToShow = "terms";
        }
        $scope.$watch('screenToShow', function() {
            $state.go('about', {page: $scope.screenToShow}, {location: 'replace'});
        });
        $scope.language = "en"; 
}]);
    