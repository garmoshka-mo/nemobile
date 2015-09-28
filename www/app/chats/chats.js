angular.module("angServices")
.service('chats', ['$rootScope', 'apiRequest', 'deviceInfo', 'Chat', 'socket',
        'storage', 'router', '$stateParams', 'externalChat',
    function($rootScope, apiRequest, deviceInfo,  Chat, socket,
             storage, router, $stateParams, externalChat) {
        
        var self = this;

        self.list = {};
        var current = null;

        log('chats', self);

        $rootScope.$on('new random chat', function(event, args) {
            current = args;
            setTimeout(function() {
                router.openOnTop('chat');
            },1);

            //if (config('debugMode'))
            //    $location.search({chat: args.type + ':' + args.channel});
        });

        self.ensureParams = function() {
            if ($stateParams.chat)
                current = {
                    type: $stateParams.chat.getChatType(),
                    channel: $stateParams.chat.getChatChannel()
                };
            return current;
        };

        self.currentParams = function() {
            return current;
        };

        self.getChat = function(channel, senderId) {
            if (!_.isUndefined(channel) && self.list[channel]) {
                return self.list[channel];
            }

            if (!_.isUndefined(senderId) && self.list[senderId]) {
                return self.list[senderId];
            }

            return false;
        };

        self.addChat = function(chatData) {
            if (chatData.channel) {
                chatData.primaryKey = 'channel';
                self.list[chatData.channel] = new Chat(chatData);
                self.list[chatData.channel].updateInfo();
                $rootScope.$broadcast('got new channel name', {channel: chatData.channel});
                self.save();
                return self.list[chatData.channel];
            }

            if (chatData.senderId) {
                chatData.primaryKey = 'senderId';
                self.list[chatData.senderId] = new Chat(chatData);
                self.list[chatData.senderId].updateInfo();
                self.save();
                return self.list[chatData.senderId];
            }
        };

        self.save = function() {
            storage.saveChats(self.list);
            log("user chats are saved");
        };

        self.parseFromStorage = function() {
            return storage.getChats().then(function(dataFromStorage) {
                var _chats = {};
                for (var key in dataFromStorage) { 
                    _chats[key] = Chat.parseFromStorage(dataFromStorage[key], self);
                }
                self.list = _chats;
                
                log("user chats are taken from storage", self.list);
            });
        };

        self.removeChat = function(channel, senderUuid) {
            if (channel) {
                pubnubSubscription.removeDeviceFromChannel(channel);
            }
            var _chat = self.getChat(channel, senderUuid);
            self.list = _.omit(self.list, _chat);
            $rootScope.$broadcast('chat removed', {chat: _chat});
            self.save();
        };

        self.countUnreadChats = function() {
            self.unreadChatsAmount = 0;
            for (var c in self.list) {
                if (!self.list[c].isRead && !self.list[c].isExpired) {
                    self.unreadChatsAmount++;
                }
            }
            log('unread chats is counted', self.unreadChatsAmount);
        }; 

        $rootScope.$on('chat was updated', self.save);

        self.getCurrentChat = function() {
            if (current.type == 'internal')
                return self.getChat(current.channel);
            else if (current.type == 'external')
                return externalChat.current_instance;
        };

        self.ensureCurrentChat = function() {
            var chat = self.getCurrentChat();

            if (!chat && current.type == 'internal')
                //getting chat object, if chat does not exist create new one
                chat = self.addChat({channel: current.channel});

            return chat;
        };

        socket.on('typing', function(e) {
            if (e.channel == current.channel)
                $rootScope.$apply(function() {
                    $rootScope.notification.typing = e.value;
                });
        });

        self.setTypingStatus = function(value, channel, uuid) {
            socket.emit("typing",
                {channel: channel, uuid: uuid, value: value});
        }

    }
]);

