//for debugging  
window.clearAll =  function() {
    localStorage.clear();
    localforage.clear();
}
services
.factory('storage', ['$localForage', '$timeout', function($localForage, $timeout) {
    
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

        saveUser: function(currentUser) {
            var _user = filterObject(currentUser, ['chats', 'friends']);
            $localForage.setItem('user', _user);
        },

        saveFriends: function(userFriends) {
            $localForage.setItem('friends', userFriends);
        },
        
        saveChats: function(userChats) {
            var _chats = {};
            var forbiddenFields = ['chatSessions', 'lastUnexpiredChatSession', 'currentUser'];
            for (var chatId in userChats) {
                _chats[chatId] = filterObject(userChats[chatId], forbiddenFields);
            }
            $localForage.setItem('chats', _chats)
            .then(function(res){console.log(res)}, function(res){console.log(res)});
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