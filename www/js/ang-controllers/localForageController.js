angular.module("angControllers").controller("localForageController", ['$scope', function($scope){

    $scope.apiUrl = localStorage['apiUrl'];

    $scope.set_api_host = function() {
        localStorage['apiUrl'] = $scope.apiUrl;
    }

}]);