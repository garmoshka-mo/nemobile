factories.factory("Chat", ['storage', 'ChatSession', 'api', '$q', function(storage, ChatSession, api, $q) {
    
    function Chat(senderId, currentUser) {
        this.senderId = senderId;
        this.chatSessions = {};
        this.chatSessionsIndexes = [];
        this.isExpired = true;
        this.isReplied = false;
        this.lastChatSessionIndex = null;
        this.lastUnexpiredChatSession = null;
        this.currentUser = currentUser;
        this.senderScores = null;
        this.title = senderId;
    }

    Chat.parseFromStorage = function(dataFromStorage, currentUser) {
        var chat = new Chat(dataFromStorage.senderId);
        chat.chatSessionsIndexes = dataFromStorage.chatSessionsIndexes;
        chat.isExpired = dataFromStorage.isExpired;
        chat.lastChatSessionIndex = dataFromStorage.lastChatSessionIndex;
        chat.senderScores = dataFromStorage.senderScores;
        chat.isRead = dataFromStorage.isRead;
        chat.title = dataFromStorage.title;
        chat.currentUser = currentUser;
        return chat;
    };

    Chat.prototype = {

        addChatSession: function(creatorId, senderId) {
            var nextIndex;

            if (this.lastChatSessionIndex === null) {
                nextIndex = 0;
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
        
        getChatSessionFromStorage: function(chatSessionId) {
            return storage.getChatSession(this.senderId, chatSessionId)
            .then(
                function(dataFromStorage) {
                    return ChatSession.parseFromStorage(dataFromStorage);
                }
            );
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
                    if (chatSession) {
                        var parsedChatSession = ChatSession.parseFromStorage(chatSession, self);
                        self.lastUnexpiredChatSession = parsedChatSession;
                        self.chatSessions[self.lastChatSessionIndex] = parsedChatSession;
                        console.log(self.currentUser);
                    }
                });
            }
        },

        updateTitle: function() {
            var self = this;

            if (self.currentUser.friendsList.nepotomFriends[self.senderId]) {
                self.title = self.currentUser.friendsList.nepotomFriends[self.senderId].displayName;
            }
            else {
                api.getUserInfoByUuid(self.senderId)
                .then(
                    function(res) {
                        console.log(res);
                        if (res.success) {
                            if (res.user.name) {
                                self.title = res.user.name;
                            }
                            else {
                                self.title = res.user.phone_number;
                            }
                        }
                    },
                    function() {
                        console.error("get chat title error");
                    }
                );
            }

            this.currentUser.saveChats();
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
            console.log("chat is removed");
            this.currentUser.saveChats();
        },

        handleExpiredChatSession: function() {
            this.lastUnexpiredChatSession = null;
            this.isExpired = true;
            console.log("chatSession is sent to archive");
        },

        removeLastChatSession: function() {
            //will remove chat if there is one expired chat session, 
            //chat is not replied and sender is not a friend
            if (this.chatSessionsIndexes.length === 1 && 
                    !this.isReplied && 
                        !this.currentUser.friendsList.nepotomFriends[this.senderId]) {
                this.remove();
            }
            
            storage.removeChatSession(this.senderId, this.lastChatSessionIndex);

            this.chatSessionsIndexes.pop();
            this.lastUnexpiredChatSession = null;
            this.isExpired = true;
            console.log("chatSession is removed");
        }
    };

    return Chat;
}]);