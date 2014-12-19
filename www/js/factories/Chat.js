factories.factory("Chat", ['$rootScope', 'storage', 'ChatSession', function($rootScope, storage, ChatSession) {
    
    function Chat(senderId) {
        
        this.senderId = senderId;
        this.chatSessions = {};
        this.chatSessionsIndexes = [];
        this.isExpired = false;
        this.lastChatSessionIndex = null;
        this.lastUnexpiredChatSession = null;

    }

    Chat.parseFromStorage = function(dataFromStorage) {
        var chat = new Chat(dataFromStorage.senderId);
        chat.chatSessionsIndexes = dataFromStorage.chatSessionsIndexes;
        chat.isExpired = dataFromStorage.isExpired;
        chat.lastChatSessionIndex = dataFromStorage.lastChatSessionIndex;
        return chat;
    }

    Chat.prototype = {

        addChatSession: function(creatorId, senderId) {
            var nextIndex;

            if (this.lastChatSessionIndex === null) {
                nextIndex = 0
            }
            else {
                nextIndex = this.lastChatSessionIndex + 1;
            }

            this.lastChatSessionIndex = nextIndex;
            var chatSession = new ChatSession(creatorId, senderId, nextIndex);
            chatSession.currentChat = this;
            this.isExpired = false;
            this.chatSessionsIndexes.push(nextIndex);
            this.chatSessions[nextIndex] = chatSession;
            this.lastUnexpiredChatSession = chatSession;

            storage.saveChats();
        },

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
                    var parsedChatSession = ChatSession.parseFromStorage(chatSession);
                    self.lastUnexpiredChatSession = parsedChatSession;
                    self.chatSessions[self.lastChatSessionIndex] = parsedChatSession;
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
            var chats = $rootScope.user.chats;
            var _chats = {};
            for (var senderId in chats) {
                if (this.senderId = senderId) continue;
                else {
                    _chats[senderId] = chats[senderId];
                }
            }
            $rootScope.user.chats = _chats;
            // $scope.$apply();
            console.log(chats);
            storage.saveChats();
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
           
            if (this.chatSessionsIndexes.length == 1) {
                this.remove();
                return false;
            }

            this.chatSessionsIndexes.pop();
            this.lastUnexpiredChatSession = null;
            this.isExpired = true;
            console.log("chatSession is removed");
        }
    }

    return Chat;
}])