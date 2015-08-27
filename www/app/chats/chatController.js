angular.module("angControllers").controller("chatController", 
    ['user','$scope', '$stateParams', '$state', 'externalChat','api', 'notification', '$timeout', 'storage', 'stickersGallery', '$sce', 'dictionary',
    function(user, $scope, $stateParams, $state, externalChat, api, notification, $timeout, storage, stickersGallery, $sce, dictionary) {
        
        log("chat controller is invoked");

        $scope.user = user;
        $scope.isStickersGalleryVisiable = false;
        $scope.stickersGallery = stickersGallery;
        $scope.isMessageSending = false;
        $scope.fromRandom = $stateParams.fromState === 'random';

        var $chatInput = $('.chat-input');

        function retrieveWords(inputString) {
            var output = inputString.match(/[A-Za-zА-Яа-я]+/g);
            return output === null ? [] : output;
        }

        function initChatHistory() {
            $scope.chatHistory = {
                previousMessages: [],
                isUpdating: false,
                lastVisibleChatSessionId: lastSession.id,
                isAllChatSessionsVisbile: $scope.chat.chatSessionsIndexes.length == 1,
                
                getOneMoreChatSession: function() {
                    var self = this;
                    self.isUpdating = true;

                    var lastIndex = $scope.chat.chatSessionsIndexes.indexOf(self.lastVisibleChatSessionId);
                    var previousId = $scope.chat.chatSessionsIndexes[lastIndex - 1];
                    
                    if (lastIndex - 1 === 0) {
                        self.isAllChatSessionsVisbile = true;
                    }

                    self.lastVisibleChatSessionId = previousId;

                    $scope.chat.getChatSessionFromStorage(previousId)
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

            var notificationString =
                "<span class='pointer'><img src='" + chat.photoUrlMini +
                "' class='chat-toolbar-image pointer'>" +
                title + "</span>";
            var notificationCallback = function() {
                // todo: правильно обрабатывать, когда внешний чат -
                // в этом случае у нас chat = externalChat
                // и контроля над отправителем нет

                // todo: исправить баги на chatInfo
                //$state.go('chatInfo',{ senderId: chat.senderId });
                // location.replace("#/showImage?link=" + chat.photoUrl);
            };
            notification.set(notificationString, notificationCallback);
        }

        $scope.scrollToBottom = function() {
            var $chatContainer = $(".main-section");
            $chatContainer.animate({scrollTop: $chatContainer[0].scrollHeight}, 500);
        };

        $scope.setFocusOnTextField = function() {
            $timeout(function() {
                $chatInput.focus();
            }, 0);
        };

        $scope.$watch('newMessage.ttl', function() {
            $scope.setFocusOnTextField();
        });

        $scope.toggleCategory = function(category) {
            if ($scope.stickersGallery.currentCategory == category.name) {
                $scope.stickersGallery.currentCategory = "";
            }
            else {
                $scope.stickersGallery.currentCategory = category.name;
            }
            $scope.isNewCategoryBlockVisible = false;
        };

        $scope.formatMessage = function(messageText) {
            if (messageText.match(/(http|https):/)) {
                var imagesExtensitions = ['gif', 'png', 'jpeg', 'jpg'];
                var splitted = messageText.split(".");
                var extensition = splitted[splitted.length - 1];

                if (imagesExtensitions.indexOf(extensition) != -1) {
                    return $sce.trustAsHtml("<a href='#/showImage?link=" + messageText + "''><img hm-double-tap='imageDoubleTap()' src='" +
                        messageText + "'></a>");
                }
                else {
                    if ($scope.isWeb) {
                        return "<a class='message-link' target='_blank' href='" + messageText + "'>" + messageText + "</a>";
                    }
                    else {
                        return $sce.trustAsHtml("<span class='message-link' onclick='navigator.app.loadUrl(\"" + encodeURI(messageText) + "\", {openExternal: true});'>" + messageText + "</span>");
                    }
                }
            }
            else {
                return messageText;
            }
        };

        $scope.disconnectRandomChat = function() {
            $scope.chat.disconnect();
            if (RAN_AS_APP) {
                window.analytics.trackEvent('send', 'event', 'random', 'finish');
            }
            else {
                ga('send', 'event', 'random', 'finish');
            }
            $state.go('random');
        };

        notification.setSmallIcon('<i class="fa fa-close"></i>', $scope.disconnectRandomChat);


        if ($stateParams.chatType == 'external') {
            $scope.chat = externalChat.current_instance;
            $scope.chat.reportStatusIfInactive();
        } else {
            //getting chat object, if chat does not exist create new one
            $scope.chat = user.getChat($stateParams.channelName, $stateParams.senderId);
            if (!$scope.chat) {
                if ($stateParams.channelName) {
                    user.addChat({channelName: $stateParams.channelName});
                    $scope.chat = user.chats[$stateParams.channelName];
                }
                else if ($stateParams.senderId) {
                    user.addChat({senderId: $stateParams.senderId});
                    $scope.chat = user.chats[$stateParams.senderId];
                }
            }
        }

        var chat = $scope.chat;
        log("chat", chat);
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
        chat.getLastUnexpiredChatSession()
        .then(
            function() {
                lastSession = chat.lastUnexpiredChatSession;
                $scope.isFirstMessage = lastSession.messages.length === 0;
                log("got chat session");
            },
            function() {
                chat.addChatSession(user.uuid, $stateParams.channelName, chat.senderId);
                chat.getLastUnexpiredChatSession();
                lastSession = chat.lastUnexpiredChatSession;
                $scope.isFirstMessage = lastSession.messages.length === 0;
                log("created new chat session");
            }
        )
        .then(
            function() {
                initChatHistory();
                $scope.chatSession = lastSession;
            }
        );
        

        $scope.$watch("chatSession.messages.length", function() {
            $scope.scrollToBottom();
            chat.isRead = true;
        });

        $scope.newMessage = {
            text: '',
            // ttl: 2592000,//30 days
            ttl: $scope.fromRandom ? 0 : 3600,
            clearText: function() {
                this.text = '';
            }
        };
       
        $scope.handleSuccessSending = function() {
            
            if (!$scope.chatSession.messages.length) {
                $scope.chatSession.creatorId = user.uuid;
            }

            $scope.isFirstMessage = false;
            $scope.errorDescription = "";
            
            // log("user:", user);
        };

        $scope.handleFailedSending = function(errorDescription) {
            $scope.errorDescription = dictionary.get(errorDescription);
        };

        function getAddress() {
            if (chat.channelName) {
                return {
                    channel: chat.channelName
                };
            }

            if (chat.senderId) {
                return {
                    uuid: chat.senderId
                };
            }
        }

        $scope.sendMessage = function(text) {
            $scope.setFocusOnTextField();
            
            var textToSend = text || $scope.newMessage.text;
            if (textToSend) {
                
                $scope.isMessageSending = true; 
                
                if (!$scope.chatSession.isReplied) {
                    if ($scope.chatSession.creatorId != user.uuid) { 
                        $scope.chatSession.setReplied();
                    }
                }

                $scope.chatSession.sendMessage(textToSend, getAddress(), $scope.newMessage.ttl)
                .then(
                    function() {
                        $scope.handleSuccessSending();
                    },
                    function(res) {
                        $scope.handleFailedSending(res);
                    }
                )
                .then( //doubling function because .finally doesn't work on android 2.2
                    function() {
                        $scope.newMessage.clearText();
                        $scope.appropriateStickers = [];
                        $scope.isMessageSending = false; 
                    },
                    function() {
                        $scope.newMessage.clearText();
                        $scope.isMessageSending = false; 
                    }
                );
            }
        };

        $scope.sendSticker = function(stickerLink) {
            $scope.sendMessage(stickerLink);
            $scope.isStickersGalleryVisiable = false;
        };

        $scope.sendAppropriateSticker = function(stickerLink) {
            $scope.sendMessage(stickerLink);
            $scope.appropriateStickers = [];
        };

        $scope.stopPropagation = function(event) {
            event.stopPropagation();
        };

        $scope.findAppropriateStiker = function() {
            var words = retrieveWords($scope.newMessage.text);
            
            if (words.length < 10) {
                $scope.appropriateStickers = [];
                
                if (stickersGallery.dictionary) {
                    words.forEach(function(word) {
                        var wordToCheck = word.toLowerCase();
                        var dictionaryEntry = stickersGallery.dictionary[wordToCheck];
                        if (dictionaryEntry) {
                            dictionaryEntry.forEach(function(category){
                                $scope.appropriateStickers = $scope.appropriateStickers.concat(category.images);
                            });
                            $scope.appropriateStickers = _.uniq($scope.appropriateStickers);
                        }
                    });
                }

                // log($scope.appropriateStickers);
            }
        };

        $scope.checkIfEnter = function(event) {
            if (event.keyCode === 13) {
                $scope.sendMessage();
            }
        };

        $scope.addStickerURL = function(message) {
            log(message);
            if (!message.isOwn) {
                if (message.text.match(/(http|https):/)) {
                    location.href = "#/addImage?imageURL=" + message.text;
                }
            }
        };

        $scope.imageDoubleTap = function() {
            alert("double tap");
        };
        
        if ($stateParams.messageText) {
            $scope.newMessage.text = $stateParams.messageText;
            $scope.sendMessage();
        }

        $(document).on("webViewShrunk", function() {
            if (location.href.match("chat?")) {
                $scope.setFocusOnTextField();
            }
        });

        if (RAN_AS_APP) {
            if (device.platform == "iOS") {
                $('.appropriateStickers-container').css(
                    {
                      'margin-top': '-200px',
                      'position': 'absolute'
                    }
                );
            }
        }

        $scope.setFocusOnTextField();
        $scope.scrollToBottom();
        user.countUnreadChats();
}]);   