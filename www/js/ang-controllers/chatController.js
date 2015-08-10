angular.module("angControllers").controller("chatController", 
    ['user','$scope', '$stateParams', '$state','api', 'notification', '$timeout', 'storage', 'stickersGallery', '$sce', '$state', 'dictionary',
    function(user, $scope, $stateParams, $state, api, notification, $timeout, storage, stickersGallery, $sce, $state, dictionary) {
        
        console.log("chat controller is invoked");

        $scope.user = user;
        $scope.isStickersGalleryVisiable = false;
        $scope.stickersGallery = stickersGallery;
        $scope.isMessageSending = false;

        var $chatInput = $('.chat-input');

        function retriveWords(inputString) {
            var output = inputString.match(/[A-Za-zА-Яа-я]+/g);
            return output === null ? [] : output;
        }

        function initChatHistory() {
            $scope.chatHistory = {
                previousMessages: [],
                isUpdating: false,
                lastVisibleChatSessionId: lastSession.id,
                isAllChatSessionsVisbile: $scope.chat.chatSessionsIndexes.length == 1 ? true : false,
                
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
                            console.log(self.previousMessages);
                            self.isUpdating = false;
                        }
                    );
                }
            };
        }

        function setNotification() {
            var title;
            
            if (chat.isVirtual || !chat.senderId) {
                if (user.friendsList.nepotomFriends[chat.senderId]) {
                    title = chat.title;
                }
                else { 
                    title = "кто-то";
                }
            }
            else {
                title = chat.title;
            }

            var notificationString = "<span class='pointer'><img src='" + chat.photoUrlMini + 
                "' class='chat-toolbar-image pointer'>" +
                title + "</span>";
            var notificationCallback = function() {
                $state.go('chatInfo',{
                    senderId: chat.senderId
                });
                // location.replace("#/showImage?link=" + chat.photoUrl);
            };
            notification.set(notificationString, notificationCallback);
        }

        $scope.scrollToBottom = function() {
            var $chatContainer = $(".chat");
            $chatContainer.animate({scrollTop: $(".chat")[0].scrollHeight}, 500);
        };

        $scope.setFocusOnTextField = function() {
            $timeout(function() {
                console.log("focus is set on textField");
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

        //getting chat object, if chat does not exist create new one
        $scope.chat = user.chats[$stateParams.channelName];
        if (!$scope.chat) {
            user.addChat({channelName: $stateParams.channelName});
            $scope.chat = user.chats[$stateParams.channelName];
        }
        var chat = $scope.chat;
        console.log("chat", chat);
        setNotification();
        
        if (chat.title === chat.senderId || !chat.photoUrlMini) {
            chat.updateInfo()
            .then(function() {
                setNotification();
            });
        }

        if (!chat.isRead) {
            chat.isRead = true;
            chat.currentUser.saveChats();
        }

        var lastSession;
        chat.getLastUnexpiredChatSession()
        .then(
            function() {
                lastSession = chat.lastUnexpiredChatSession;
                $scope.isFirstMessage = lastSession.messages.length === 0 ? true : false;
                console.log("got chat session");
            },
            function() {
                chat.addChatSession(user.uuid, $stateParams.channelName, chat.senderId);
                chat.getLastUnexpiredChatSession();
                lastSession = chat.lastUnexpiredChatSession;
                $scope.isFirstMessage = lastSession.messages.length === 0 ? true : false;
                console.log("created new chat session");
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
            ttl: 3600,
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
            
            // console.log("user:", user);
        };

        $scope.handleFailedSending = function(errorDescription) {
            $scope.errorDescription = dictionary.get(errorDescription);
        };

        chat.sendMessage = function(text) {
            $scope.setFocusOnTextField();
            
            var textToSend = text || $scope.newMessage.text;
            if (textToSend) {
                
                $scope.isMessageSending = true; 
                
                if (!$scope.chatSession.isReplied) {
                    if ($scope.chatSession.creatorId != user.uuid) { 
                        $scope.chatSession.setReplied();
                    }
                }

                $scope.chatSession.sendMessage(textToSend, chat.channelName, $scope.newMessage.ttl)
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
            chat.sendMessage(stickerLink);
            $scope.isStickersGalleryVisiable = false;
        };

        $scope.sendAppropriateSticker = function(stickerLink) {
            chat.sendMessage(stickerLink);
            $scope.appropriateStickers = [];
        };

        $scope.stopPropagation = function(event) {
            event.stopPropagation();
        };

        $scope.findAppropriateStiker = function() {
            var words = retriveWords($scope.newMessage.text);
            
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

                // console.log($scope.appropriateStickers);
            }
        };

        $scope.checkIfEnter = function(event) {
            if (event.keyCode === 13) {
                chat.sendMessage();
            }
        };

        $scope.addStickerURL = function(message) {
            console.log(message);
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
            chat.sendMessage();
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