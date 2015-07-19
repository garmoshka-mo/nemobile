factories.factory("Chat", ['storage', 'ChatSession', 'api', '$q', function(storage, ChatSession, api, $q) {
    
    function Chat(chatData) {
        this.senderId = chatData.senderId;
        this.chatSessions = chatData.chatSession ? chatData.chatSession : {};
        this.chatSessionsIndexes = chatData.chatSessionsIndexes ? chatData.chatSessionsIndexes : [];
        this.lastChatSessionIndex = !_.isUndefined(chatData.lastChatSessionIndex) ? 
            chatData.lastChatSessionIndex : null;
        this.lastUnexpiredChatSession = chatData.lastUnexpiredChatSession ? 
            chatData.lastUnexpiredChatSession : null;
        this.currentUser = chatData.currentUser;
        this.senderScores = chatData.senderScores ? chatData.senderScores : null;
        this.title = chatData.title ? chatData.title : chatData.senderId;
        this.photoUrl = chatData.photoUrl ? chatData.photoUrl : null;
        this.photoUrlMini = chatData.photoUrlMini ? chatData.photoUrlMini : null;
        this.isExpired = !_.isUndefined(chatData.isExpired) ? chatData.isExpired : false;
        this.isRead = !_.isUndefined(chatData.isRead) ? chatData.isRead : true;
        this.isReplied = !_.isUndefined(chatData.isReplied) ? chatData.isReplied : false;
        this.isVirtual = !_.isUndefined(chatData.isVirtual) ? chatData.isVirtual : false;
        if (chatData.isVirtual) {
            this.link = chatData.isVirtual ? chatData.link : null;
            this.friendIndex = chatData.friendIndex ? chatData.friendIndex : null;
        }
        this.lastMessageTimestamp = chatData.lastMessageTimestamp ? chatData.lastMessageTimestamp : 
            null;
    }

    Chat.parseFromStorage = function(dataFromStorage, currentUser) {
        dataFromStorage.currentUser = currentUser;
        var chat = new Chat(dataFromStorage);
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

            chatSession.save();
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
            var d = $q.defer();

            var found = false;
            var self = this;

            if (this.isExpired) {
                d.reject("chat is expired");
            }

            //if chatSessionIndexes length === 0, that means that chat is new
            if (!this.chatSessionsIndexes.length) {
                d.reject("there are no chat sessions in this chat");
            }

            if (this.lastChatSessionIndex !== null) {
                this.lastUnexpiredChatSession = this.chatSessions[this.lastChatSessionIndex];
                found = this.lastUnexpiredChatSession ? true : false;
            }

            if (found) {
                d.resolve(this.lastUnexpiredChatSession);
            }
            else {
                storage.getChatSession(this.senderId, this.lastChatSessionIndex)
                .then(
                    function(chatSession) {
                        if (chatSession) {
                            var parsedChatSession = ChatSession.parseFromStorage(chatSession, self);
                            self.lastUnexpiredChatSession = parsedChatSession;
                            self.chatSessions[self.lastChatSessionIndex] = parsedChatSession;
                            d.resolve(self.lastUnexpiredChatSession);
                            // console.log("user", self.currentUser);
                        }
                    },
                    function() {
                        d.reject("getting from storag error");
                    }
                );

            }
            return d.promise;
        },

        //updates chat's photo and title
        updateInfo: function(force) {
            //force parameter forces function to get information from server
            var self = this;
            var d = $q.defer();

            if (self.currentUser.friendsList.nepotomFriends[self.senderId] && !force) {
                var friend = self.currentUser.friendsList.nepotomFriends[self.senderId];
                self.title = friend.displayName;
                if (friend.photos) {
                    self.photoUrl = friend.photos[0].value; 
                    self.photoUrlMini = friend.photos[0].valueMini ?
                        friend.photos[0].valueMini : friend.photos[0].value; 
                }
                else {
                    self.photoUrl = App.Settings.adorableUrl + '/' + self.senderId;
                    self.photoUrlMini = App.Settings.adorableUrl + '/40/' + self.senderId;
                }
                d.resolve();
            }
            else {
                api.getUserInfoByUuid(self.senderId)
                .then(
                    function(res) {
                        console.log("api.getUserInfoByUuid", res);
                        if (res.success) {
                            if (res.user.name) {
                                self.title = res.user.name;
                            }
                            else {
                                self.title = res.user.phone_number;
                            }

                            if (res.user.avatar_guid || res.user.avatar_url) {
                                self.photoUrl = user.parseAvatarDataFromServer(res.user).fullSize;
                                self.photoUrlMini = user.parseAvatarDataFromServer(res.user).mini;
                            }
                            else {
                                self.photoUrl = App.Settings.adorableUrl + '/' + self.senderId;
                                self.photoUrlMini = App.Settings.adorableUrl + '/40/' + self.senderId;
                            }
                        }
                    },
                    function() {
                        console.error("get chat title error");
                        d.reject();
                    }
                )
                .then(
                    function() {
                        self.currentUser.saveChats();
                        d.resolve();
                    }
                );
            }

            this.currentUser.saveChats();
            return  d.promise;
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
            //remove chat if there is one expired chat session, 
            //chat is not replied 
            if (this.chatSessionsIndexes.length === 1 && 
                    !this.isReplied) {
                this.remove();
            }
            
            storage.removeChatSession(this.senderId, this.lastChatSessionIndex);

            this.chatSessionsIndexes.pop();
            this.lastUnexpiredChatSession = null;
            this.isExpired = true;
            console.log("chatSession is removed");
        },
    };

    return Chat;
}]);