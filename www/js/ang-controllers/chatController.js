angular.module("angControllers").controller("chatController", ['$rootScope','$scope', '$stateParams', '$state','api', 'notification', function($rootScope, $scope, $stateParams, $state, api, notification) {

        var user = $rootScope.user;
        $scope.chat = user.chats[$stateParams.senderId];
        var chat = $scope.chat;
        var lastSession = chat.getLastUnexpiredChatSession();
        
        $scope.newMessage = {
            text: '',
            ttl: 10,
            clearText: function() {
                this.text = ''
            }
        };
        
        if (!lastSession) {
            api.addNewChatSession(chat.senderId)
            lastSession = chat.getLastUnexpiredChatSession()
            lastSession.creatorId = user.uuid;
        }

        $scope.chatSession = lastSession;
        $scope.isFirstMessage = !$scope.chatSession.messages.length;

        $scope.$watch("chatSession.messages.length", function() {
            var $chatContainer = $(".chat");
            $chatContainer.animate({scrollTop: $chatContainer.height()}, 500)
        })

        if (user.friends[chat.senderId]) {
            notification.set(user.friends[chat.senderId].name)
        }
        console.log($rootScope.notification);
        
        $scope.handleSuccessSending = function() {
            
            if (!$scope.chatSession.messages.length) {
                $scope.chatSession.creatorId = user.uuid;
            }

            $scope.isFirstMessage = false;
            // $scope.chatSession.isReplied = $scope.chatSession.messages.length > 1  ? true : false;
            $scope.errorDescription = "";
            $scope.chatSession.messages.push({
                text: $scope.newMessage.text,
                isOwn: true
            });
            console.log("user:");
            console.log(user);
        }

        $scope.handleFailedSending = function(errorDescription) {
            $scope.errorDescription = errorDescription;
        }

        $scope.closeErrorDescription = function() {
            $scope.errorDescription = "";
        }

        chat.sendMessage = function() {
            if ($scope.newMessage.text) {
                
                if (!$scope.chatSession.isReplied) {
                    if ($scope.chatSession.creatorId != user.uuid) { 
                        $scope.chatSession.isReplied = true;
                    }
                }

                if ($scope.chatSession.isReplied) {
                    $scope.newMessage.ttl = 0;
                }

                $scope.newMessage.ttl = 0;

                api.sendMessage($scope.newMessage.text, chat.senderId, $scope.newMessage.ttl)
                .then(
                    function() {
                        $scope.handleSuccessSending();
                    },
                    function(res) {
                        $scope.handleFailedSending(res);
                    }
                )
                .finally(
                    function() {
                        $scope.newMessage.clearText();
                    }
                )
            }

        }
        console.log($scope.chat);

    
}])
    