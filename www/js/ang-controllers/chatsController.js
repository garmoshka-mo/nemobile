angular.module("angControllers").controller("chatsController", [
    'user', '$scope', '$http', '$timeout', 'api', 'notification',
    function(user, $scope, $http, $timeout, api, notification) {
        console.log("chats controller is invoked");
        $scope.$watch('user.chats', function() {
            if (user) {
                var chats = user.chats;
                for (var chatId in chats) {
                    chats[chatId].getLastUnexpiredChatSession();
                }
                $scope.user = user;
            }
        });

        $scope.getChatTitle = function(chat) {
            return chat.title;
        };
}]);