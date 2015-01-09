factories.factory("Chat", ['storage', 'ChatSession', function(storage, ChatSession) {
    
    function Chat(senderId, currentUser) {
        
        this.senderId = senderId;
        this.chatSessions = {};
        this.chatSessionsIndexes = [];
        this.isExpired = true;
        this.lastChatSessionIndex = null;
        this.lastUnexpiredChatSession = null;
        this.currentUser = currentUser;
        this.senderScores = null;

    }

    Chat.parseFromStorage = function(dataFromStorage, currentUser) {
        var chat = new Chat(dataFromStorage.senderId);
        chat.chatSessionsIndexes = dataFromStorage.chatSessionsIndexes;
        chat.isExpired = dataFromStorage.isExpired;
        chat.lastChatSessionIndex = dataFromStorage.lastChatSessionIndex;
        chat.senderScores = dataFromStorage.senderScores;
        chat.currentUser = currentUser;
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
            var chatSession = new ChatSession(creatorId, senderId, nextIndex, this);
            this.isExpired = false;
            this.chatSessionsIndexes.push(nextIndex);
            this.chatSessions[nextIndex] = chatSession;
            this.lastUnexpiredChatSession = chatSession;

            this.currentUser.saveChats();
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
                    var parsedChatSession = ChatSession.parseFromStorage(chatSession, self);
                    self.lastUnexpiredChatSession = parsedChatSession;
                    self.chatSessions[self.lastChatSessionIndex] = parsedChatSession;
                    console.log(self.currentUser);
                })
            }
        },

        getChatTitle: function() {
            if (this.currentUser.friends[this.senderId]) {
                return this.currentUser.friends[this.senderId].name;
            }
            else {
                return this.senderId;
            }
        },

        remove: function() {
            var chats = this.currentUser.chats;
            var _chats = {};
            for (var senderId in chats) {
                if (this.senderId == senderId) continue;
                else {
                    _chats[senderId] = chats[senderId];
                }
            }
            this.currentUser.chats = _chats;
            // $scope.$apply();
            console.log(chats);
            this.currentUser.saveChats();
        },

        handleExpiredChatSession: function() {
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