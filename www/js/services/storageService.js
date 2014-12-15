//for debugging  

services
.factory('storage', ['$rootScope', '$localForage', function($rootScope, $localForage) {
       
    var storage = {
        
        clear: function() {
            localStorage.clear();
            $localForage.clear();
        },
        
        getUser: function() {   
            return $localForage.getItem('user');
        },

        getChats: function() {
            return $localForage.getItem('chats')
            .then(
                function(res) {
                    for (var key in res) { 
                        angular.extend(res[key], objects.chat);
                        res[key].chatSessions = {}
                    }
                    return res;
                },
                function() {
                    return false;
                }
            );
        },

        getFriends: function() {
            return $localForage.getItem('friends');
        },

        getChatSession: function(senderId, index) {
            var key = "chatSession_" + senderId + "_" + index;
            return $localForage.getItem(key).then(function(chatSession) {
                return angular.extend(chatSession, objects.chatSession);
            })
        },

        saveUser: function() {
            var user = $rootScope.user;
            var _user = {
                name: user.name,
                channel: user.channel,
                uuid: user.uuid,
                accessToken: user.accessToken
            }
            $localForage.setItem('user', _user);
        },

        saveFriends: function() {
            $localForage.setItem('friends', $rootScope.user.friends);
        },
        
        saveChats: function() {
            var _chats = {};
            var userChats = $rootScope.user.chats;
            for (var chatId in userChats) {
                _chats[chatId] = {};
                _chats[chatId].chatSessionsIndexes = userChats[chatId].chatSessionsIndexes;
                _chats[chatId].lastChatSessionIndex = userChats[chatId].lastChatSessionIndex;
                _chats[chatId].senderId = userChats[chatId].senderId;
            }
            $localForage.setItem('chats', _chats);
        },

        saveChatSession: function(chatSessionObj, senderId) {
            var _chatSession = {};
            for (var key in chatSessionObj) {
                if (typeof chatSessionObj[key] != "function") {
                    _chatSession[key] = chatSessionObj[key];
                }
            }
            $localForage.setItem('chatSession_' + senderId + "_" + chatSessionObj.id, _chatSession);
        } 

    }
    
    var objects = { 
        chat: {
            getLastUnexpiredChatSession: function() {
                var found = false;
                var self = this;

                if (this.lastChatSessionIndex !== undefined) {
                    this.lastChatSession = this.chatSessions[this.lastChatSessionIndex.toString()];
                    found = this.lastChatSession ? true : false;
                }

                if (!found) {
                    storage.getChatSession(this.senderId, this.lastChatSessionIndex)
                    .then(function(chatSession) {
                        self.lastChatSession = chatSession;
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
            }
        },

        chatSession: {
            isReplied: false,
            isExpired: false,
            whenExpires: null,

            getLastMessage: function() {
                if (this.messages.length) {
                    var messagesAmount = this.messages.length;
                    return this.messages[messagesAmount - 1].text;
                }
            }
        }

    };
    return storage;   
}])