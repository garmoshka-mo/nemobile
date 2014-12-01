angular.module("angControllers").controller("chatsController", function($scope, $http, api){
    api.getUnseenMessages();
    $scope.goToChat = function(chat) {
        location.href = "#/chat/" + chat.senderId;
    }
});