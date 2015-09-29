angular.module("angControllers").controller("chatController", 

    ['user','$scope', '$stateParams', '$state', 'externalChat','api', 'timer',
        'notification', '$timeout', 'storage', 'stickersGallery', '$sce', 'dictionary', 'deviceInfo',
            'chats', 'googleAnalytics', 'router', 'view',
    function(user, $scope, $stateParams, $state, externalChat, api, timer,
             notification, $timeout, storage, stickersGallery, $sce, dictionary, deviceInfo,
                chats, googleAnalytics, router, view) {

        log("chat controller is invoked");

        $scope.user = user;
        $scope.isMessageSending = false;
        $scope.isRandom = true;
        $scope.deviceInfo = deviceInfo;

        var params = chats.ensureParams();
        if (!params) return router.goto('pubsList');
        var type = params.type;

        var chat = chats.ensureCurrentChat();
        $scope.chat = chat;
        log("chat", chat);

        if (type == 'external')
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

        function setNotification() {
            var title = "кто-то";
            
            // if (chat.isVirtual || !chat.senderId) {
            //     title = "кто-то";
            // }
            // else {
            //     title = chat.title;
            // }

            var notificationCallback = function() {
                // todo: правильно обрабатывать, когда внешний чат -
                // в этом случае у нас chat = externalChat
                // и контроля над отправителем нет

                // todo: исправить баги на chatInfo
                //$state.go('chatInfo',{ senderId: chat.senderId });
                // location.replace("#/showImage?link=" + chat.photoUrl);
            };
            notification.setTitleAttributes(title, chat.avatar.urlMini);
            //notification.setClickHandler(notificationCallback);
        }

        $scope.disconnectRandomChat = function() {
            chat.disconnect();
            googleAnalytics.dialogComplete();
            timer.stop();
            notification.setSmallIcon(null);
            router.openOnTop('randomRestart');
        };

        notification.setSmallIcon('<i class="fa fa-close"></i>', $scope.disconnectRandomChat);
        notification.setChatDisconnectHandler($scope.disconnectRandomChat);

        setNotification();
        
        if (chat.title === chat.senderId || !chat.photoUrlMini) {
            chat.updateInfo()
            .then(function() {
                setNotification();
            });
        }

        if (!chat.isRead && chat.currentUser) {
            chat.isRead = true;
            chat.currentUser.saveChats();
        }

        var lastSession;
        chat.ensureSession()
        .then(function(session) {
            $scope.chatSession = lastSession = session;
            $scope.isFirstMessage = lastSession.messages.length === 0;
            initChatHistory();
        });

        $scope.$watch("chatSession.messages.length", function() {
            view.scrollDownTopSection();
            chat.isRead = true;
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
}]);