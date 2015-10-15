//for debugging  
window.clearAll =  function() {
    localStorage.clear();
    localforage.clear();
};
angular.module("angServices")
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

        get: function(key){
            return $localForage.getItem(key);
        },
        save: function(key, value){
             $localForage.setItem(key, value);
        },

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
            var exclude = ['honor', 'passivePromise'];
            var _user = filterObject(currentUser, exclude);
            $localForage.setItem('user', _user);
            // .then(function(res){console.log(res)},function(res){console.log(res)})
        },

        saveFriendsList: function(userFriendsList) {
            var notToSave = ['nepotomFriends'];
            $localForage.setItem('friendsList', filterObject(userFriendsList, notToSave));
        },
        
        saveChats: function(userChats) {
            var notToSave = ['current', 'list'];
            $localForage.setItem('chats', filterObject(userChats, notToSave));
        },

        saveChatSession: function(chatSessionObj, primaryKeyValue) {
            var notToSave = ['timer', 'currentChat', 'filter'];
            var _chatSession = filterObject(chatSessionObj, notToSave);
            // log('!!!!!!!!!!!!!!!!!!primaryKeyValue', primaryKeyValue);
            $localForage.setItem('chatSession_' + primaryKeyValue + "_" + chatSessionObj.id, _chatSession);
            // .then(
            //     function(res) {
            //         log(res);
            //     },
            //     function(res) {
            //         log(res);
            //     }
            // )
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