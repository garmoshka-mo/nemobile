angular.module("angControllers").controller("chatsController", function($scope, $http){
    $scope.goToChat = function(chat) {
        location.href = "#/chat/" + chat.senderId;
    }
});