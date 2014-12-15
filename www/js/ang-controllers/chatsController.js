angular.module("angControllers").controller("chatsController", function($rootScope, $scope, $http, $timeout, api, notification) {
    console.log("chats controller is invoked")
    $scope.$watch('user.chats', function() {
        if ($rootScope.user) {
            var chats = $rootScope.user.chats;
            for (var chatId in chats) {
                chats[chatId].getLastUnexpiredChatSession();
            }
        }
    })
})