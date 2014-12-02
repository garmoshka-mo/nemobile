angular.module("angControllers").controller("friendSearchController", function($scope, $http, api){
    // api.getUnseenMessages();
    $scope.findUserByName = function() {
        api.searchUser($scope.nameToSearch)
    }
});