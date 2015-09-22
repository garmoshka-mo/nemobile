angular.module("angFactories").factory("Chat",
    ['storage', 'Avatar', 'ChatSession', 'apiRequest', '$q', 'notification', '$rootScope', 'friendsList',
    function(storage, Avatar, ChatSession, apiRequest, $q, notification, $rootScope, friendsList) {
    
    function Chat(chatData) {
        var self = this;

        this.senderId = chatData.senderId;
        this.channelName = chatData.channelName;
        this.chatSessions = chatData.chatSession ? chatData.chatSession : {};
        this.chatSessionsIndexes = chatData.chatSessionsIndexes ? chatData.chatSessionsIndexes : [];
        this.lastChatSessionIndex = !_.isUndefined(chatData.lastChatSessionIndex) ? 
            chatData.lastChatSessionIndex : null;
        this.lastUnexpiredChatSession = chatData.lastUnexpiredChatSession ? 
            chatData.lastUnexpiredChatSession : null;

        this.senderScore = chatData.senderScore ? chatData.senderScore : null;

        this.title = chatData.title ? chatData.title : chatData.senderId;
        this.avatar = Avatar.fromId(chatData.channelName);
        this.isExpired = !_.isUndefined(chatData.isExpired) ? chatData.isExpired : false;
        this.isRead = !_.isUndefined(chatData.isRead) ? chatData.isRead : true;
        this.isReplied = !_.isUndefined(chatData.isReplied) ? chatData.isReplied : false;
        this.isVirtual = !_.isUndefined(chatData.isVirtual) ? chatData.isVirtual : false;
        this.isActive = !_.isUndefined(chatData.isActive) ? chatData.isActive : true;
        this.primaryKey = !_.isUndefined(chatData.primaryKey) ? chatData.primaryKey : 'channelName'; 
        if (chatData.isVirtual) {
            this.link = chatData.isVirtual ? chatData.link : null;
            this.friendIndex = chatData.friendIndex ? chatData.friendIndex : null;
        }
        this.lastMessageTimestamp = chatData.lastMessageTimestamp ? chatData.lastMessageTimestamp : 
            null;
    }

    Chat.parseFromStorage = function(dataFromStorage) {
        var chat = new Chat(dataFromStorage);
        chat.avatar = Avatar.parseFromStorage(dataFromStorage.avatar);
        return chat;
    };

    Chat.prototype = {

        typing: function() {
            // implement
        },

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
            $rootScope.$broadcast('chat was updated');
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
                return d.promise;
            }

            //if chatSessionIndexes length === 0, that means that chat is new
            if (!this.chatSessionsIndexes.length) {
                d.reject("there are no chat sessions in this chat");
                return d.promise;
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
                if (friendsList.nepotomFriends[self.senderId] && !force) {
                    var friend = friendsList.nepotomFriends[self.senderId];
                    self.title = friend.displayName;

                    if (friend.photos)
                        self.avatar = Avatar.fromPhotos(friend.photos);
                    else
                        self.avatar = Avatar.fromId(self.channelName);

                    d.resolve();
                }
                else {
                    apiRequest.send(
                        'POST',
                        '/users',
                        {
                            "user_uuid": self.senderId
                        }
                    )
                    .then(
                        function(res) {
                            log("api.getUserInfoByUuid", res);
                            if (res.user.name) {
                                self.title = res.user.name;
                            }
                            else {
                                self.title = res.user.phone_number;
                            }

                            if (res.user.avatar_guid || res.user.avatar_url) {
                                self.avatar = new Avatar(res.user);
                            }
                            else {
                                self.avatar = Avatar.fromId(self.channelName);
                            }
                        },
                        function() {
                            console.error("get chat title error");
                            d.reject();
                        }
                    )
                    .then(
                        function() {
                            $rootScope.$broadcast('chat was updated');
                            d.resolve();
                        }
                    );
                }
            }
            else {
                self.title = "кто-то";
                self.photoUrl = config('adorableUrl') + '/' + self.channelName;
                self.photoUrlMini = config('adorableUrl') + '/40/' + self.channelName;
                d.resolve();
            }

            $rootScope.$broadcast('chat was updated');
            return  d.promise;
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
            // this.currentUser.removeDeviceFromChannel(this.channelName);
            if (this.lastUnexpiredChatSession)
                this.lastUnexpiredChatSession.sessionFinished();
            this.isActive = false;
            window.onbeforeunload = null;
            return apiRequest.send('DELETE', '/chats/' + this.channelName);
        }
    };

    return Chat;
}]);