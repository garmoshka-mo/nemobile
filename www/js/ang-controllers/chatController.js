angular.module("angControllers").controller("chatController", 
    ['user','$scope', '$stateParams', '$state','api', 'notification', '$timeout', 'storage', 'stickersGallery',
    function(user, $scope, $stateParams, $state, api, notification, $timeout, storage, stickersGallery) {
        
        console.log("chat controller is invoked");

        $scope.isStickersGalleryVisiable = false;
        $scope.stickersGallery = stickersGallery;
        $scope.isMessageSending = false; 

        var $chatInput = $('.chat-input');

        $scope.scrollToBottom = function() {
            var $chatContainer = $(".chat");
            $chatContainer.animate({scrollTop: $(".chat")[0].scrollHeight}, 500);
        };

        $scope.setFocusOnTextField = function() {
            $timeout(function() {
                console.log("focus is set on textField");
                $chatInput.focus();
            }, 0);

            if (window.device) {
                if (device.platform == "iOS") {
                    $timeout(function() {
                        $chatInput.focus();
                        console.log("focus is set on textField ios");
                    }, 300);
                }
            }
        };
        
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
                    return "<img src='" + messageText + "'>";
                }
                else {
                    return "<a class='message-link' href='" + messageText + "'>" + messageText + "</a>";
                }
            }
            else {
                return messageText;
            }
        };


        $scope.chat = user.chats[$stateParams.senderId];
        var chat = $scope.chat;
        chat.getLastUnexpiredChatSession();
        if (!chat.isRead) {
            chat.isRead = true;
            chat.currentUser.saveChats();
        }
        var lastSession = chat.lastUnexpiredChatSession;
        
        if (!lastSession) {
            chat.addChatSession(user.uuid, chat.senderId);
            chat.getLastUnexpiredChatSession();
            lastSession = chat.lastUnexpiredChatSession;
            lastSession.save();
        }

        $scope.chatSession = lastSession;
        $scope.isFirstMessage = !$scope.chatSession.messages.length;

        $scope.$watch("chatSession.messages.length", function() {
            $scope.scrollToBottom();
            chat.isRead = true;
        });

        if (user.friends[chat.senderId]) {
            notification.set(user.friends[chat.senderId].name);
        }

        $scope.newMessage = {
            text: '',
            ttl: 600,
            clearText: function() {
                this.text = '';
            }
        };


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

        $scope.handleSuccessSending = function() {
            
            if (!$scope.chatSession.messages.length) {
                $scope.chatSession.creatorId = user.uuid;
            }

            $scope.isFirstMessage = false;
            $scope.errorDescription = "";
            
            console.log("user:", user);
        };

        $scope.handleFailedSending = function(errorDescription) {
            $scope.errorDescription = errorDescription;
        };

        $scope.closeErrorDescription = function() {
            $scope.errorDescription = "";
        };

        chat.sendMessage = function() {
            $scope.setFocusOnTextField();
            
            if ($scope.newMessage.text) {
                
                $scope.isMessageSending = true; 
                
                if (!$scope.chatSession.isReplied) {
                    if ($scope.chatSession.creatorId != user.uuid) { 
                        $scope.chatSession.isReplied = true;
                    }
                }

                $scope.chatSession.sendMessage($scope.newMessage.text, chat.senderId, $scope.newMessage.ttl)
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
            $scope.newMessage.text = stickerLink;
            $scope.isStickersGalleryVisiable = false;
            chat.sendMessage();
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
        
        if ($stateParams.messageText) {
            $scope.newMessage.text = $stateParams.messageText;
            chat.sendMessage();
        }

        $(document).on("webViewShrunk", function() {
            if (location.href.match("chat?")) {
                $scope.setFocusOnTextField();
            }
        });

        $scope.setFocusOnTextField();
        $scope.scrollToBottom();
}]);   