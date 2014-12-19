factories.factory('User', ['storage', 'Chat', function(storage, Chat) {
    
    function User(accessToken, name, uuid, channel) {
        this.name = name;
        this.uuid = uuid;
        this.accessToken = accessToken;
        this.channel = channel;
        this.friends = {},
        this.chats = {}
    }

    User.prototype = {
        
        addFriend: function(uuid, name) {
            this.friends[uuid] = {name: name};
            storage.saveFriends();
        },

        addChat: function(senderId) {
            this.chats[senderId] = new Chat(senderId);
            storage.saveChats();
        }
    }

    User.parseFromStorage = function(dataFromStorage) {
        return new User(
            dataFromStorage.accessToken,
            dataFromStorage.name,
            dataFromStorage.uuid,
            dataFromStorage.channel
        ) 
    }

    User.parseChatsFromStorage = function(dataFromStorage) {
        var _chats = {};
        for (var key in dataFromStorage) { 
            _chats[key] = Chat.parseFromStorage(dataFromStorage[key]);
        }
        return _chats;
    }

    return User;
}])