angular.module("angControllers").controller("chatController", 

    ['user','$scope', '$stateParams', '$state','api', 'timer',
        'notification', '$timeout', 'storage', 'stickersGallery', '$sce', 'dictionary', 'deviceInfo',
            'chats', 'googleAnalytics', 'router', 'view', 'chatHeader', 'circleMenu',
    function(user, $scope, $stateParams, $state, api, timer,
             notification, $timeout, storage, stickersGallery, $sce, dictionary, deviceInfo,
                chats, googleAnalytics, router, view, chatHeader, circleMenu) {

        log("chat controller is invoked");

        $scope.user = user;
        $scope.isMessageSending = false;
        $scope.isRandom = true;
        $scope.deviceInfo = deviceInfo;


        var chat = chats.current;
        $scope.chat = chat;
        log("chat", chat);

        if (chat.type == 'external')
            chat.reportStatusIfInactive();

        function initChatHistory() {
            $scope.chatHistory = {
                previousMessages: [],
                isUpdating: false,
                lastVisibleChatSessionId: lastSession.id,
                isAllChatSessionsVisbile: chat.chatSessionsIndexes.length == 1,
                
                getOneMoreChatSession: function() {
                    var self = this;
                    self.isUpdating = true;

                    var lastIndex = chat.chatSessionsIndexes.indexOf(self.lastVisibleChatSessionId);
                    var previousId = chat.chatSessionsIndexes[lastIndex - 1];
                    
                    if (lastIndex - 1 === 0) {
                        self.isAllChatSessionsVisbile = true;
                    }

                    self.lastVisibleChatSessionId = previousId;

                    chat.getChatSessionFromStorage(previousId)
                    .then(
                        function(chatSession) {
                            self.previousMessages = chatSession.messages.concat(self.previousMessages);
                            log(self.previousMessages);
                            self.isUpdating = false;
                        }
                    );
                }
            };
        }

        function setChatHeader() {

            var notificationCallback = function() {
                // todo: правильно обрабатывать, когда внешний чат -
                // в этом случае у нас chat = externalChat
                // и контроля над отправителем нет

                // todo: исправить баги на chatInfo
                //$state.go('chatInfo',{ senderId: chat.senderId });
                // location.replace("#/showImage?link=" + chat.photoUrl);
            };
            chatHeader.setChatHeader(chat);
        }


        function disconnectRandomChat(feedback) {
            chat.disconnect(false, feedback);
            googleAnalytics.dialogComplete();
            timer.stop();
            notification.setSmallIcon(null);
        }

        $scope.closeAndLookAgain = function() {
            disconnectRandomChat();
            router.openOnTop('lookAgain');
        };

        $scope.closeAndChatSettings = function() {
            disconnectRandomChat();
            router.openOnTop('randomFull');
        };

        $scope.disconnectRandomChat = function(feedback) {
            disconnectRandomChat(feedback);
            router.openOnTop('randomRestart');
        };

        var handler = chats.disconnectWithoutFeedback ? 
            $scope.disconnectRandomChat : circleMenu.open;
        notification.setSmallIcon('<i class="fa fa-close"></i>', handler);
        notification.setChatDisconnectHandler($scope.disconnectRandomChat);

        $scope.$watch('chat.isActive', function(newValue) {
            if (!newValue) {
                notification.setSmallIcon('<i class="fa fa-close"></i>', $scope.disconnectRandomChat);   
            }
        });
        
        if (chat.title === chat.senderId || !chat.photoUrlMini) {
            chat.updateInfo()
            .then(function() {
                    setChatHeader();
                });
        }

        var lastSession;
        chat.ensureSession()
            .then(function (session) {
                setChatHeader();
                session.conversationBegan();
                $scope.chatSession = lastSession = session;
                $scope.isFirstMessage = lastSession.messages.length === 0;
                initChatHistory();
            });

        $scope.$watch("chatSession.messages.length", function() {
            view.scrollDownTopSection();
            chat.isRead = true;
        });

        $scope.$on("$destroy", function(){
            user.honor.turnOn();
        });

        $scope.stopPropagation = function(event) {
            event.stopPropagation();
        };
        
        if ($stateParams.messageText) {
            $scope.newMessage.text = $stateParams.messageText;
            $scope.sendMessage();
        }

        window.onbeforeunload = function() {
            return chat.isActive ?
                'При уходе со страницы чат будет завершен. Покинуть страницу?' : 
                null;
        };

        view.scrollDownTopSection();
        chats.countUnreadChats();

        setTimeout(function() {
            notification.suppressOnFocus = false;
        }, 1000);
}]);