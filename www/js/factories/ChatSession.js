factories.factory('ChatSession', ['$timeout', 'storage', 'api', '$q', function($timeout, storage, api, $q) {
    
    function ChatSession(creatorId, senderId, id, currentChat) {
        this.isExpired = false;
        this.isReplied = false;
        this.id = id;
        this.senderId = senderId;
        this.messages = [];
        this.timer = null;
        this.creatorId = creatorId;
        this.currentChat = currentChat;
        this.whenExipires = Infinity;
    }

    var deviceServerTimeDifference_msec;

    function calculateMessageTtl(expires) {
        var currentServerTime = new Date().getTime() + deviceServerTimeDifference_msec;
        var ttl = expires * 1000 - currentServerTime;
        console.log("time to live(sec): " +  ttl / 1000);
        return ttl;
    }

    ChatSession.parseFromStorage = function(dataFromStorage, currentChat) {
        var chatSession = new ChatSession(
            dataFromStorage.creatorId,
            dataFromStorage.senderId,
            dataFromStorage.id
        );

        chatSession.messages = dataFromStorage.messages;
        chatSession.isReplied = dataFromStorage.isReplied;
        chatSession.extraTime = dataFromStorage.extraTime; 
        chatSession.currentChat = currentChat;
        if (dataFromStorage.whenExipires === null) {
            chatSession.whenExipires = Infinity;
        }
        else {
            chatSession.whenExipires = dataFromStorage.whenExipires;
        }
        
        var ttl = chatSession.whenExipires - new Date().getTime();

        if (ttl < 0) {
            chatSession.isExpired = true;
            $timeout(function() {
                chatSession.close();
            }, 0);
        } 
        else {
            chatSession.isExpired = false;
            chatSession.setTimeout(ttl);
        }

        return chatSession;
    };

    ChatSession.prototype = {
            
        close: function() {
            this.isExpired = true;
            
            if (this.isReplied) {
                this.currentChat.handleExpiredChatSession();
            }
            else {
                this.currentChat.removeLastChatSession();
            }
            console.warn("chat session expired");
        },

        // removeLastUnrepliedMessages: function() {
        //     var lastMessageIndex = this.messages.length - 1;
        //     var lastMessageIsOwn = this.messages[lastMessageIndex].isOwn;
        //     var firstIndexToRemove = lastMessageIndex - 1;
        //     for (var i = lastMessageIndex; i >= 0; i--) {
        //         if (this.messages[i].isOwn === lastMessageIsOwn) {
        //             firstIndexToRemove = i;
        //         }
        //         else {
        //             break;
        //         }
        //     } 
        //     var amountToDelete = lastMessageIndex - firstIndexToRemove + 1;
        //     this.messages.splice(firstIndexToRemove, amountToDelete);
        //     storage.saveChatSession(this);
        // },

        setTimeout: function(time) {
            var self = this;
            console.log("timer for chatSession is set. Left(msec): " + time);
            
            // if time is more than 2147483647 (approximately 24 days) timer callback function is called instantly 
            // https://stackoverflow.com/questions/3468607/why-does-settimeout-break-for-large-millisecond-delay-values/3468650#3468650
 
            if (time > 2147483647) {
                this.extraTime = time - 2147483647;
                time = 2147483647;
                console.log("extra time is added(msec): " + this.extraTime);
            }

            if (this.timer) {
                $timeout.cancel(this.timer);
            }

            this.timer = $timeout(function() {
                if (self.extraTime > 0) {
                    self.setTimeout(self.extraTime);
                    return false;
                }
                self.close();
            }, time);
        },

        setTimer: function(expires) {
            var chatSession = this;
            var ttl;
            if (deviceServerTimeDifference_msec) {
                ttl = calculateMessageTtl(expires);
                chatSession.setTimeout(ttl);
                chatSession.whenExipires = new Date().getTime() + ttl;                  
            }
            else {
                api.getTimeDifference()
                .then(function(timeDifference) {
                    deviceServerTimeDifference_msec = timeDifference;
                    ttl = calculateMessageTtl(expires);
                    chatSession.setTimeout(ttl);
                    chatSession.whenExipires = new Date().getTime() + ttl;
                    storage.saveChatSession(chatSession);
                });
            }
        },

        setReplied: function() {
            this.isReplied = true;
            if (!this.currentChat.isReplied) {
                this.currentChat.isReplied = true;
            }
        },

        save: function() {
            storage.saveChatSession(this, this.senderId);
            console.log("chat session is saved");
        },

        getLastMessage: function() {
            if (this.messages.length) {
                var messagesAmount = this.messages.length;
                var text = this.messages[messagesAmount - 1].text;
                if (text.match(/(http|https):/)) {
                    var imagesExtensitions = ['gif', 'png', 'jpeg', 'jpg'];
                    var splitted = text.split(".");
                    var extensition = splitted[splitted.length - 1];

                    if (imagesExtensitions.indexOf(extensition) != -1) {
                        return "(изображение)";
                    }
                    else {
                        return "(ссылка)";
                    }
                }
                else {
                    return text;
                }
            }
        }, 

        sendMessage: function(message, receiverId, ttl) {
            var self = this;
            return api.sendMessage(message, receiverId, ttl)
            .then(
                function(res) {
                    console.log("message is sent", res);
                    
                    if (res.data.success && !res.data.type) {
                       
                        if (!self.messages.length) {
                            self.creatorId = self.currentChat.currentUser.uuid;
                        }

                        self.messages.push({
                            text: message,
                            isOwn: true
                        });
                        self.setTimer(res.data.expires);
                        self.save();
                        console.log("chat session is saved");
                        return true;
                    }
                    else {
                        return $q.reject(res.data.type);
                    }

                },
                function(res) {
                    console.error(res);
                }
            );
        }
    };
    
    return ChatSession;
}]);