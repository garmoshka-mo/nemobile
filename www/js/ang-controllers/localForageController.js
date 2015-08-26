angular.module("angControllers").controller("localForageController", ['$scope', function($scope){

    $scope.apiUrl = localStorage.apiUrl || App.Settings.apiUrl;
    $scope.debug = localStorage.debug === 'true' || App.Settings.debug;
    $scope.externalChat = localStorage.externalChat === 'true' || false;

    $scope.$watch('apiUrl', function() {
        localStorage['apiUrl'] = $scope.apiUrl;
    });
    $scope.$watch('externalChat', function() {
        localStorage['externalChat'] = $scope.externalChat;
    });
    $scope.$watch('debug', function() {
        localStorage['debug'] = $scope.debug;
    });


}]);