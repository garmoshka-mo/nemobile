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
                _chats[chatId] = filterObject(userChats[chatId], forbiddenFields);
            }
            $localForage.setItem('chats', _chats);
        },

        saveChatSession: function(chatSessionObj) {
            var notToCopyProperties = ['timer', 'currentChat'];
            var _chatSession = filterObject(chatSessionObj, notToCopyProperties);
            $localForage.setItem('chatSession_' + chatSessionObj.senderId + "_" + chatSessionObj.id, _chatSession)
        },

        removeChatSession: function(senderId, index) {
            var key = "chatSession_" + senderId + "_" + index;
            $localForage.removeItem(key);
        } 

    }
    return storage;   
}])