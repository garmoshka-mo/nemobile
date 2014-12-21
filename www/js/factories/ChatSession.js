factories.factory('ChatSession', ['$rootScope', '$timeout', 'storage', function($rootScope, $timeout, storage) {
    
    function ChatSession(creatorId, senderId, id) {
        this.isExpired = false;
        this.isReplied = false;
        this.id = id;
        this.senderId = senderId;
        this.messages = [];
        this.timer = null;
        this.creatorId = creatorId;
        this.currentChat = null;
        this.whenExipires = null;
    }

    ChatSession.parseFromStorage = function(dataFromStorage) {
        var chatSession = new ChatSession(
            dataFromStorage.creatorId,
            dataFromStorage.senderId,
            dataFromStorage.id
        )
        chatSession.messages = dataFromStorage.messages;
        chatSession.isReplied = dataFromStorage.isReplied;
        chatSession.timer = dataFromStorage.timer;
        chatSession.whenExipires = dataFromStorage.whenExipires;

        var ttl = chatSession.whenExipires - new Date().getTime();

        if (ttl < 0) {
            chatSession.isExpired = true;
            $timeout(function() {
                chatSession.closeChatSession()
            }, 0)
        } 
        else {
            chatSession.isExpired = false;
            chatSession.setTimer(ttl);
        }

        chatSession.getCurrentChat();

        return chatSession;
    }

    ChatSession.prototype = {
            
        closeChatSession: function() {
            this.isExpired = true;
            
            if (this.isReplied) {
                this.currentChat.handleExpiredChatSession();
                this.removeLastUnrepliedMessages();
            }
            else {
                this.currentChat.removeLastChatSession();
            }
            console.warn("chat is expired");
        },

        removeLastUnrepliedMessages: function() {
            var lastMessageIndex = this.messages.length - 1;
            var lastMessageIsOwn = this.messages[lastMessageIndex].isOwn;
            var firstIndexToRemove = lastMessageIndex - 1;
            for (var i = lastMessageIndex; i >= 0; i--) {
                if (this.messages[i].isOwn === lastMessageIsOwn) {
                    firstIndexToRemove = i;
                }
                else {
                    break;
                }
            } 
            var amountToDelete = lastMessageIndex - firstIndexToRemove + 1;
            this.messages.splice(firstIndexToRemove, amountToDelete);
            storage.saveChatSession(this, this.senderId);
        },

        getCurrentChat: function() {
            this.currentChat = $rootScope.user.chats[this.senderId];
        },
        
        setTimer: function(time) {
            var self = this;
            console.log("timer for chatSession is set. Left(msec): " + time);
            if (this.timer) {
                $timeout.cancel(this.timer);
            }
            this.timer = $timeout(function() {
                self.closeChatSession()
            }, time)
        },

        getLastMessage: function() {
            if (this.messages.length) {
                var messagesAmount = this.messages.length;
                return this.messages[messagesAmount - 1].text;
            }
        }
    }
    
    return ChatSession;
}])