angular.module("angControllers").controller("chatController", ['$rootScope','$scope', '$stateParams', '$state','api', 'notification', function($rootScope, $scope, $stateParams, $state, api, notification) {

        var user = $rootScope.user;
        $scope.chat = user.chats[$stateParams.senderId];
        var chat = $scope.chat;

        if (user.friends[chat.senderId]) {
            notification.set(user.friends[chat.senderId].name)
        }
        console.log($rootScope.notification);
        chat.sendMessage = function() {
           
            if (chat.newMessage) {
                chat.messages.push({
                    text: chat.newMessage,
                    isOwn: true
                });
                api.sendMessage(chat.newMessage, chat.senderId)
                chat.newMessage = '';
                chat.lastMessageTimestamp = new Date().getTime();
            }

        }
        console.log($scope.chat);

    
}])
    