factories.factory("Chat",
    ['storage', 'avatars', 'ChatSession', 'api', '$q',
    function(storage, avatars, ChatSession, api, $q) {
    
    function Chat(chatData) {
        this.senderId = chatData.senderId;
        this.channelName = chatData.channelName;
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
        this.primaryKey = !_.isUndefined(chatData.primaryKey) ? chatData.primaryKey : 'channelName'; 
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

        addChatSession: function(creatorId, channelName, senderId) {
            var nextIndex;

            if (this.lastChatSessionIndex === null) {
                nextIndex = 0;
            }
            else {
                nextIndex = this.lastChatSessionIndex + 1;
            }

            this.lastChatSessionIndex = nextIndex;
            var chatSession = new ChatSession(creatorId, channelName, senderId, nextIndex, this);
            this.isExpired = false;
            this.chatSessionsIndexes.push(nextIndex);
            this.chatSessions[nextIndex] = chatSession;
            this.lastUnexpiredChatSession = chatSession;

            chatSession.save();
            this.currentUser.saveChats();
        },
        
        getChatSessionFromStorage: function(chatSessionId) {
            // log('thisssssssssss', this);
            var self = this;
            return storage.getChatSession(this[this.primaryKey], chatSessionId)
            .then(
                function(dataFromStorage) {
                    if (dataFromStorage) {
                        return ChatSession.parseFromStorage(dataFromStorage, self);
                    }
                    else {
                        console.warn("didn't find chatSession " + self[self.primaryKey] + "_" + chatSessionId);
                    }
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
                self.getChatSessionFromStorage(this.lastChatSessionIndex)
                .then(
                    function(chatSession) {
                        if (chatSession) {
                            self.lastUnexpiredChatSession = chatSession;
                            self.chatSessions[self.lastChatSessionIndex] = chatSession;
                            d.resolve(self.lastUnexpiredChatSession);
                            // log("user", self.currentUser);
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

            if (self.senderId) {
                if (self.currentUser.friendsList.nepotomFriends[self.senderId] && !force) {
                    var friend = self.currentUser.friendsList.nepotomFriends[self.senderId];
                    self.title = friend.displayName;

                    if (friend.photos)
                        self.ava = avatars.from_photos(friend.photos);
                    else
                        self.ava = avatars.from_id(self.senderId);
                    // todo: заменить код на использование объекта self.ava = ava
                    self.photoUrl = self.ava.url;
                    self.photoUrlMini = self.ava.url_mini;

                    d.resolve();
                }
                else {
                    api.getUserInfoByUuid(self.senderId)
                    .then(
                        function(res) {
                            log("api.getUserInfoByUuid", res);
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
                                    self.ava = avatars.from_id(self.senderId);
                                    self.photoUrl = self.ava.url;
                                    self.photoUrlMini = self.ava.url_mini;
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
            }
            else {
                self.title = "кто-то";
                self.photoUrl = App.Settings.adorableUrl + '/' + self.channelName;
                self.photoUrlMini = App.Settings.adorableUrl + '/40/' + self.channelName;
                d.resolve();
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
            log("chat is removed");
            this.currentUser.saveChats();
        },

        handleExpiredChatSession: function() {
            this.lastUnexpiredChatSession = null;
            this.isExpired = true;
            log("chatSession is sent to archive");
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
            log("chatSession is removed");
        },

        disconnect: function() {
            this.currentUser.removeDeviceFromChannel(this.channelName);
            return api.deleteChat(this.channelName);
        }
    };

    return Chat;
}]);