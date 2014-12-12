//for debugging  
window.clearAll = function() {
    localforage.clear();
    localStorage.clear();
}
services
.factory('storage', ['$rootScope', '$localForage', 'objects', function($rootScope, $localForage, objects) {
    return {
        
        clear: function() {
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
                        angular.extend(res[key], objects.chat)
                    }
                    res.chatSessions = {};
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
            return $localforage.getItem(key)
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
}])