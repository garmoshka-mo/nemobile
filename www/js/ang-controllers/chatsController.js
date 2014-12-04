angular.module("angControllers").controller("chatsController", function($rootScope, $scope, $http,$timeout, api, notification){
    api.getUnseenMessages();
    
});