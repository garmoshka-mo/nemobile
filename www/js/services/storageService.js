//for debugging  
window.clearAll =  function() {
    localStorage.clear();
    localforage.clear();
}
services
.factory('storage', ['$rootScope', '$localForage', '$timeout', function($rootScope, $localForage, $timeout) {
    
    function filterObject(object, forbiddenFieldsArray) {
        var buffer = {};

        if (!forbiddenFieldsArray) {
            forbiddenFieldsArray = [];
        }

        for (var key in object) {
            if (typeof object[key] != "function" && forbiddenFieldsArray.indexOf(key) == -1) {
                buffer[key] = object[key];
            }
        }
        return buffer;
    }

    var storage = {
        
        clear: function() {
            localStorage.clear();
            $localForage.clear();
        },
        
        getUser: function() {   
            return $localForage.getItem('user');
        },

        getChats: function() {
            return $localForage.getItem('chats');
        },

        getFriends: function() {
            return $localForage.getItem('friends');
        },

        getChatSession: function(senderId, index) {
            var key = "chatSession_" + senderId + "_" + index;
            return $localForage.getItem(key);
        },

        saveUser: function() {
            var user = $rootScope.user;
            var _user = filterObject(user, ['chats', 'friends']);
            $localForage.setItem('user', _user);
        },

        saveFriends: function() {
            $localForage.setItem('friends', $rootScope.user.friends);
        },
        
        saveChats: function() {
            var _chats = {};
            var userChats = $rootScope.user.chats;
            var forbiddenFields = ['chatSessions', 'lastUnexpiredChatSession']
            for (var chatId in userChats) {
                _chats[chatId] = filterObject(userChats[chatId])
            }
            $localForage.setItem('chats', _chats);
        },

        saveChatSession: function(chatSessionObj, senderId) {
            var notToCopyProperties = ['timer', 'currentChat'];
            var _chatSession = filterObject(chatSessionObj, notToCopyProperties);
            $localForage.setItem('chatSession_' + senderId + "_" + chatSessionObj.id, _chatSession)
            .then(
                function(res){
                    console.log(res);
                },
                function(res){
                    console.log(res);
                }
            )
        },

        removeChatSession: function(senderId, index) {
            var key = "chatSession_" + senderId + "_" + index;
            $localForage.removeItem(key);
        } 

    }
    
    var objects = { 
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

    };
    return storage;   
}])