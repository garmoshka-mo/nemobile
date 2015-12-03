(function(){
angular.module("angFactories").factory('ChatSession',
    ['$timeout', 'storage', 'api', '$q', 'notification', 'ChatSessionAbstract', 'userRequest',
    function($timeout, storage, api, $q, notification, ChatSessionAbstract, userRequest) {
    
    function ChatSession(creatorId, channel, senderId, id, currentChat) {

        new ChatSessionAbstract().extend(this);

        this.isExpired = false;
        this.isReplied = false;
        this.id = id;
        this.channel = channel;
        this.senderId = senderId;
        this.messages = [];
        this.timer = null;
        this.creatorId = creatorId;
        this.currentChat = currentChat;
        this.chat = currentChat;
        this.whenExipires = Infinity;
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

    ChatSession.loadFromStorage = function(dataFromStorage, currentChat) {
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

        setReplied: function() {
            this.isReplied = true;
            if (!this.currentChat.isReplied) {
                this.currentChat.isReplied = true;
            }
        },

        save: function() {
            // storage.saveChatSession(this, this.currentChat[this.currentChat.primaryKey]);
            // log("chat session is saved");
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
                error("there's no recipient address");
                return;
            }
            
            return userRequest.send(
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

                    // todo: переделать на ивенты
                    if (message === "$===real===") {
                        message = "<span class='text-bold'>пользователю отправлено уведомление о регистрации</span>";
                        // message = $sce.trustAsHtml(message);
                    }

                    self.myMessageSent(message);

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