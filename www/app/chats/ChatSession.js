(function(){
angular.module("angFactories").factory('ChatSession',
    ['$timeout', 'storage', 'api', '$q', 'notification', 'ChatSessionAbstract', 'apiRequest',
    function($timeout, storage, api, $q, notification, ChatSessionAbstract, apiRequest) {
    
    function ChatSession(creatorId, channel, senderId, id, currentChat) {
        this.isExpired = false;
        this.isReplied = false;
        this.id = id;
        this.channel = channel;
        this.senderId = senderId;
        this.messages = [];
        this.timer = null;
        this.creatorId = creatorId;
        this.currentChat = currentChat;
        this.whenExipires = Infinity;

        angular.extend(this, new ChatSessionAbstract());
    }

    var deviceServerTimeDifference_msec;

    function calculateMessageTtl(expires) {
        var currentServerTime = new Date().getTime() + deviceServerTimeDifference_msec;
        var ttl = expires * 1000 - currentServerTime;
        log("time to live(sec): " +  ttl / 1000);
        return ttl;
    }

    function htmlToPlaintext(text) {
        return String(text).replace(/<[^>]+>/gm, '');
    }

    ChatSession.parseFromStorage = function(dataFromStorage, currentChat) {
        var chatSession = new ChatSession(
            dataFromStorage.creatorId,
            dataFromStorage.channel,
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

        setTimeout: function(time) {
            var self = this;
            // log("timer for chatSession is set. Left(msec): " + time);
            
            // if time is more than 2147483647 (approximately 24 days) timer callback function is called instantly 
            // https://stackoverflow.com/questions/3468607/why-does-settimeout-break-for-large-millisecond-delay-values/3468650#3468650
 
            if (time > 2147483647) {
                this.extraTime = time - 2147483647;
                time = 2147483647;
                // log("extra time is added(msec): " + this.extraTime);
            }

            if (this.timer) {
                $timeout.cancel(this.timer);
            }

            this.timer = $timeout(function() {
                if (self.extraTime > 0) {
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
                apiRequest.send(
                    'GET',
                    '/time'
                )
                .then(function(res) {
                    var time = res.origin_time;
                    var deviceServerTimeDifference_msec = time * 1000 - new Date().getTime();
                    log("Difference with server time(msec): ", deviceServerTimeDifference_msec);
                    return deviceServerTimeDifference_msec;
                })
                .then(function(timeDifference) {
                    deviceServerTimeDifference_msec = timeDifference;
                    ttl = calculateMessageTtl(expires);
                    chatSession.setTimeout(ttl);
                    chatSession.whenExipires = new Date().getTime() + ttl;
                    chatSession.save();
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
            storage.saveChatSession(this, this.currentChat[this.currentChat.primaryKey]);
            log("chat session is saved");
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
                    return htmlToPlaintext(text);
                }
            }
        },

        sendMessage: function(message, address, ttl) {
            var self = this;

            var data = {
                "message_text": message,
                "ttl": ttl
            };

            if (address.channel) {
                data.channel = address.channel;
            }
            else if (address.uuid) {
                data.recipient_uuid = address.uuid;
            }
            else {
                console.error("there's no recipient address");
                return;
            }
            
            return apiRequest.send(
                'POST',
                '/messages',
                data
            )
            .then(
                function(res) {
                    // log("message is sent", res);
                       
                    // if (!self.messages.length) {
                    //     self.creatorId = self.currentChat.currentUser.uuid;
                    // }

                    if (message === "$===real===") {
                        message = "<span class='text-bold'>пользователю отправлено уведомление о регистрации</span>";
                        // message = $sce.trustAsHtml(message);
                    }

                    self.addMessage({
                        text: message.sanitize(),
                        isOwn: true
                    });

                    // todo: fix logic bugs and uncomment
                    // self.setTimer(res.expires);
                    self.save();
                    log("chat session is saved");
                    return true;
                    
                },
                function(error) {
                    return $q.reject(error);
                }
            );
        }
    };
    
    return ChatSession;
}]);
})();