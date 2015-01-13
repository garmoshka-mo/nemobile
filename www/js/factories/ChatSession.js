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
        this.whenExipires = null;
    }

    var deviceServerTimeDifference_msec;

    function calculateMessageTtl(message) {
        var currentServerTime = new Date().getTime() + deviceServerTimeDifference_msec;
        var ttl = message.expires * 1000 - currentServerTime;
        console.log("time to live(sec): " +  ttl / 1000);
        return ttl;
    }

    ChatSession.parseFromStorage = function(dataFromStorage, currentChat) {
        var chatSession = new ChatSession(
            dataFromStorage.creatorId,
            dataFromStorage.senderId,
            dataFromStorage.id
        )

        chatSession.messages = dataFromStorage.messages;
        chatSession.isReplied = dataFromStorage.isReplied;
        chatSession.timer = dataFromStorage.timer;
        chatSession.whenExipires = dataFromStorage.whenExipires;
        chatSession.currentChat = currentChat;

        var ttl = chatSession.whenExipires - new Date().getTime();

        if (ttl < 0) {
            chatSession.isExpired = true;
            $timeout(function() {
                chatSession.close()
            }, 0)
        } 
        else {
            chatSession.isExpired = false;
            chatSession.setTimeout(ttl);
        }

        return chatSession;
    }

    ChatSession.prototype = {
            
        close: function() {
            this.isExpired = true;
            
            if (this.isReplied) {
                this.currentChat.handleExpiredChatSession();
            }
            else {
                this.currentChat.removeLastChatSession();
            }
            console.warn("chat is expired");
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
            if (this.timer) {
                $timeout.cancel(this.timer);
            }
            this.timer = $timeout(function() {
                self.close()
            }, time)
        },

        setTimer: function(message) {
            var chatSession = this;
            var ttl;
            if (deviceServerTimeDifference_msec) {
                ttl = calculateMessageTtl(message);
                chatSession.setTimeout(ttl);
                chatSession.whenExipires = new Date().getTime() + ttl;                  
            }
            else {
                api.getTimeDifference()
                .then(function(timeDifference) {
                    deviceServerTimeDifference_msec = timeDifference;
                    ttl = calculateMessageTtl(message);
                    chatSession.setTimeout(ttl);
                    chatSession.whenExipires = new Date().getTime() + ttl;
                    storage.saveChatSession(chatSession);
                })
            }
        },

        save: function() {
            storage.saveChatSession(this, this.senderId);
        },

        getLastMessage: function() {
            if (this.messages.length) {
                var messagesAmount = this.messages.length;
                var text = this.messages[messagesAmount - 1].text;
                if (text.match(/(http|https):/)) {
                    var imagesExtensitions = ['gif', 'png', 'jpeg', 'jpg']
                    var splitted = text.split(".");
                    var extensition = splitted[splitted.length - 1];

                    if (imagesExtensitions.indexOf(extensition) != -1) {
                        return "(image)";
                    }
                    else {
                        return "(link)";
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
                        })
                        self.setTimer(res.data);
                        self.save();
                        console.log("chat session is saved");
                        return true;
                    }
                    else {
                        return $q.reject(res.data.type);
                    }

                },
                function(res) {
                    console.error(res)
                }
            )
        }
    }
    
    return ChatSession;
}])