(function() {
        services
        .service('chats', ['$rootScope', 'apiRequest', 'deviceInfo', 'Chat', 'storage',
            function($rootScope, apiRequest, deviceInfo,  Chat, storage) {
                var list = {};

                this.getChat = function(channelName, senderId) {
                    if (!_.isUndefined(channelName) && list[channelName]) {
                        return list[channelName];
                    }

                    if (!_.isUndefined(senderId) && list[senderId]) {
                        return list[senderId];
                    }

                    return false;
                };

                this.addChat = function(chatData) {

                    if (chatData.channelName) {
                        chatData.primaryKey = 'channelName';
                        list[chatData.channelName] = new Chat(chatData);
                        list[chatData.channelName].updateInfo();
                        user.registerDeviceToChannel(chatData.channelName);
                        return list[chatData.channelName];
                    }

                    if (chatData.senderId) {
                        chatData.primaryKey = 'senderId';
                        list[chatData.senderId] = new Chat(chatData);
                        list[chatData.senderId].updateInfo();
                        return list[chatData.senderId];
                    }

                    this.save();
                };

                this.save = function() {
                    storage.saveChats(list);
                    log("user chats are saved");
                };

                this.parseFromStorage = function() {
                    return storage.getChats().then(function(dataFromStorage) {
                        var _chats = {};
                        for (var key in dataFromStorage) { 
                            _chats[key] = Chat.parseFromStorage(dataFromStorage[key], self);
                        }
                        list = _chats;
                        
                        log("user chats are taken from storage", user.chats);
                    });
                };

                this.removeChat = function(channelName, senderUuid) {
                    list = _.omit(list, this.getChat(channelName, senderUuid));
                    this.save(); 
                };

                this.countUnreadChats = function() {
                    this.unreadChatsAmount = 0;
                    for (var chat in list) {
                        if (!list[chat].isRead && !list[chat].isExpired) {
                            this.unreadChatsAmount++;
                        }
                    }
                    log('unread chats is counted', this.unreadChatsAmount);
                }; 

                $rootScope.$on('chat was updated', this.save);

            }
        ]);
    }

)();