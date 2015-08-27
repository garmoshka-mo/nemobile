//for debugging  
window.clearAll =  function() {
    localStorage.clear();
    localforage.clear();
};
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
        
        //get methods
        getUser: function() {   
            return $localForage.getItem('user');
        },

        getChats: function() {
            return $localForage.getItem('chats');
        },

        getFriends: function() {
            return $localForage.getItem('friends');
        },

        getFriendsList: function() {
            return $localForage.getItem('friendsList');
        },

        getChatSession: function(primaryKeyValue, index) {
            var key = "chatSession_" + primaryKeyValue + "_" + index;
            return $localForage.getItem(key);
        },

        getLastMessageTimestamp: function() {
            return $localForage.getItem('lastMessageTimestamp');
        },

        //save methods
        saveUser: function(currentUser) {
            var notToSave = ['chats', 'friends', 'friendsList'];
            var _user = filterObject(currentUser, notToSave);
            $localForage.setItem('user', _user);
        },

        saveFriendsList: function(userFriendsList) {
            var notToSave = ['nepotomFriends'];
            $localForage.setItem('friendsList', filterObject(userFriendsList, notToSave));
        },
        
        saveChats: function(userChats) {
            var _chats = {};
            var notToSave = ['chatSessions', 'lastUnexpiredChatSession', 'currentUser'];
            for (var chatId in userChats) {
                _chats[chatId] = filterObject(userChats[chatId], notToSave);
            }
            $localForage.setItem('chats', _chats);
        },

        saveChatSession: function(chatSessionObj, primaryKeyValue) {
            var notToSave = ['timer', 'currentChat'];
            var _chatSession = filterObject(chatSessionObj, notToSave);
            // log('!!!!!!!!!!!!!!!!!!primaryKeyValue', primaryKeyValue);
            $localForage.setItem('chatSession_' + primaryKeyValue + "_" + chatSessionObj.id, _chatSession);
        },

        saveLastMessageTimestamp: function(timestamp) {
            $localForage.setItem('lastMessageTimestamp', timestamp);
        },

        //clear methods
        removeChatSession: function(senderId, index) {
            var key = "chatSession_" + senderId + "_" + index;
            $localForage.removeItem(key);
        },

        clear: function() {
            localStorage.clear();
            $localForage.clear();
        }
    };
    return storage;   
}]);