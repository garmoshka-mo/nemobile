angular.module("angControllers").controller("chatController", ['$rootScope','$scope', '$stateParams', '$state','api', 'notification', function($rootScope, $scope, $stateParams, $state, api, notification) {

        var user = $rootScope.user;
        $scope.chat = user.chats[$stateParams.senderId];
        var chat = $scope.chat;
        $scope.chatSession = chat.getLastUnexpiredChatSession();

        $scope.$watch("chatSession.messages.length", function() {
            var $chatContainer = $(".chat");
            $chatContainer.animate({scrollTop: $chatContainer.height()}, 500)
        })
        if (user.friends[chat.senderId]) {
            notification.set(user.friends[chat.senderId].name)
        }
        console.log($rootScope.notification);
        chat.sendMessage = function() {
            if (chat.newMessage) {
                $scope.chatSession.messages.push({
                    text: chat.newMessage,
                    isOwn: true
                });
                api.sendMessage(chat.newMessage, chat.senderId)
                chat.newMessage = '';
            }

        }
        console.log($scope.chat);

    
}])
    