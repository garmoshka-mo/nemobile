angular.module("angControllers").controller("chatController", 

    ['user','$scope', '$stateParams', '$state','api', 'timer',
        'notification', '$timeout', 'storage', 'stickersGallery', '$sce', 'dictionary', 'deviceInfo',
            'chats', 'googleAnalytics', 'router', 'view', 'chatHeader', 'circleMenu', '$translate',
    function(user, $scope, $stateParams, $state, api, timer,
             notification, $timeout, storage, stickersGallery, $sce, dictionary, deviceInfo,
                chats, googleAnalytics, router, view, chatHeader, circleMenu, $translate) {

        log("chat controller is invoked");

        $scope.user = user;
        $scope.isMessageSending = false;
        $scope.deviceInfo = deviceInfo;


        var chat = chats.getCurrent();
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
            chats.unsetCurrent();
            chat.disconnect(false, feedback);
            googleAnalytics.dialogComplete();
            timer.stop();
            notification.setSmallIcon(null);
        }

        $scope.closeAndLookAgain = function() {
            disconnectRandomChat();
            router.changeChatState('lookAgain');
        };

        $scope.closeAndChatSettings = function() {
            disconnectRandomChat();
            router.changeChatState('randomFull');
        };

        $scope.disconnectRandomChat = function(feedback, route) {
            disconnectRandomChat(feedback);
            router.changeChatState(route || 'randomRestart');
        };
        
        notification.setSmallIcon('<i class="fa fa-close circle-menu-open-button no-menu-drag"></i>', exitButtonClickHandler);
        notification.setChatDisconnectHandler($scope.disconnectRandomChat);

        function exitButtonClickHandler() {
            if (chat.isActive && !chats.disconnectWithoutFeedback && !chat.isVirtual) {
                circleMenu.open();
            }
            else {
                $scope.disconnectRandomChat();
            }
        }
       
        $timeout(function() {
            var circleMenuOpenButton = new Hammer($(".circle-menu-open-button").get(0), {
                inputClass: Hammer.TouchMouseInput
            });

            circleMenuOpenButton.on('press', function() {
                circleMenu.open();
            });
        }, 0);
        

        
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

        $translate('alert.chat.closeActive').then(function(msg) {
            window.onbeforeunload = function() {
                return chat.isActive && !chat.isVirtual ?
                    msg :
                    null;
            };
        });

        view.scrollDownTopSection();
        chats.countUnreadChats();

        setTimeout(function() {
            notification.suppressOnFocus = false;
        }, 1000);
}]);