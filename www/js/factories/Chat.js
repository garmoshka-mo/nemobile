factories.factory("Chat",['$rootScope', function($rootScope) {
    
    function Chat(senderId) {
        
        this.senderId = senderId;
        this.chatSessions = {};
        this.chatSessionsIndexes = [];
        this.isExpired = false;
        this.lastChatSessionIndex = null;

    }

    Chat.prototype = {

        getLastUnexpiredChatSession: function() {
            var found = false;
            var self = this;

            if (this.isExpired) {
                return false;
            }

            if (this.lastChatSessionIndex !== undefined) {
                this.lastUnexpiredChatSession = this.chatSessions[this.lastChatSessionIndex];
                found = this.lastUnexpiredChatSession ? true : false;
            }

            if (!found) {
                storage.getChatSession(this.senderId, this.lastChatSessionIndex)
                .then(function(chatSession) {
                    self.lastUnexpiredChatSession = chatSession;
                    self.chatSessions[self.lastChatSessionIndex] = chatSession;
                    console.log($rootScope.user);
                })
            }
        },

        getChatTitle: function() {
            if ($rootScope.user.friends[this.senderId]) {
                return $rootScope.user.friends[this.senderId].name;
            }
            else {
                return this.senderId;
            }
        },

        remove: function() {
            var chats = $rootScope.chats;
            var _chats = {};
            for (var senderId in chats) {
                if (this.senderId = senderId) continue;
                else {
                    _chats[senderId] = chats[senderId];
                }
            }
            $rootScope.chats = _chats;
        },

        handleExpiredChatSession: function() {
            storage.saveChatSession(this.senderId, this.lastChatSessionIndex);
            this.lastUnexpiredChatSession = null;
            this.isExpired = true;
            console.log("chatSession is sent to archive");
        },

        removeLastChatSession: function() {
            if (this.chatSessionsIndexes.length == 1) {
                this.remove();
            }
            storage.removeChatSession(this.senderId, this.lastChatSessionIndex);
            this.chatSessionsIndexes.pop();
            this.lastUnexpiredChatSession = null;
            this.isExpired = true;
            console.log("chatSession is removed");
        }
    }

    return Chat;
}])