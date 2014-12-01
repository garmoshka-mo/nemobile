angular.module("angControllers").controller("chatController", ['$rootScope','$scope', '$stateParams', '$state','api', function($rootScope, $scope, $stateParams, $state, api) {

        var user = $rootScope.user;
        console.log(user);
        $scope.chat = user.chats[$stateParams.senderId];
        
        var chat = $scope.chat;

        chat.sendMessage = function() {
           
            if (chat.newMessage) {
                chat.messages.push({
                    text: chat.newMessage,
                    isOwn: true
                });
                api.sendMessage(chat.newMessage, chat.senderId)
                chat.newMessage = '';
            }

        }
        console.log($scope.chat);

    
}])
    