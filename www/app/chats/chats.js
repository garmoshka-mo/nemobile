services
.service('chats', ['$rootScope', 'apiRequest', 'deviceInfo', 'Chat', 'storage', 
    function($rootScope, apiRequest, deviceInfo,  Chat, storage) {
        
        var chats = this;
        chats.list = {};
        console.log('chats',chats);

        chats.getChat = function(channelName, senderId) {
            if (!_.isUndefined(channelName) && chats.list[channelName]) {
                return chats.list[channelName];
            }

            if (!_.isUndefined(senderId) && chats.list[senderId]) {
                return chats.list[senderId];
            }

            return false;
        };

        chats.addChat = function(chatData) {
            if (chatData.channelName) {
                chatData.primaryKey = 'channelName';
                chats.list[chatData.channelName] = new Chat(chatData);
                chats.list[chatData.channelName].updateInfo();
                $rootScope.$broadcast('got new channel name', {channelName: chatData.channelName});
                chats.save();
                return chats.list[chatData.channelName];
            }

            if (chatData.senderId) {
                chatData.primaryKey = 'senderId';
                chats.list[chatData.senderId] = new Chat(chatData);
                chats.list[chatData.senderId].updateInfo();
                chats.save();
                return chats.list[chatData.senderId];
            }
        };

        chats.save = function() {
            storage.saveChats(chats.list);
            log("user chats are saved");
        };

        chats.parseFromStorage = function() {
            return storage.getChats().then(function(dataFromStorage) {
                var _chats = {};
                for (var key in dataFromStorage) { 
                    _chats[key] = Chat.parseFromStorage(dataFromStorage[key], self);
                }
                chats.list = _chats;
                
                log("user chats are taken from storage", user.chats);
            });
        };

        chats.removeChat = function(channelName, senderUuid) {
            if (channelName) {
                pubnubSubscription.removeDeviceFromChannel(channelName);
            }
            var _chat = chats.getChat(channelName, senderUuid);
            chats.list = _.omit(chats.list, _chat);
            $rootScope.$broadcast('chat removed', {chat: _chat});
            chats.save(); 
        };

        chats.countUnreadChats = function() {
            chats.unreadChatsAmount = 0;
            for (var chat in chats.list) {
                if (!chats.list[chat].isRead && !chats.list[chat].isExpired) {
                    chats.unreadChatsAmount++;
                }
            }
            log('unread chats is counted', chats.unreadChatsAmount);
        }; 

        $rootScope.$on('chat was updated', chats.save);

    }
]);

