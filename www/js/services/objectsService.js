services
.factory('objects', ['$rootScope', '$timeout', 'storage', function($rootScope, $timeout, storage) {
    return { 
        chat: {
            isExpired: false,

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
        },

        chatSession: {
            isReplied: false,
            isExpired: false,
            timer: null,

            closeChatSession: function() {
                this.isExpired = true;
                
                if (this.isReplied) {
                    this.currentChat.handleExpiredChatSession();
                    var lastMessageIndex = this.messages.length;
                    this.messages.splice(lastMessageIndex, 1);
                }
                else {
                    this.currentChat.removeLastChatSession();
                }

                console.warn("chat is expired");
            },

            getCurrentChat: function() {
                this.currentChat = $rootScope.user.chats[this.senderId];
            },

            setTimer: function(time) {
                var self = this;
                console.log("time in SetTimer func" + time);
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

    }
}])