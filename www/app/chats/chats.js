angular.module("angServices")
.service('chats', ['$rootScope', 'deviceInfo', 'Chat', 'socket',
        'storage', 'router', 'random',
    function($rootScope, deviceInfo,  Chat, socket,
             storage, router, random) {
        
        var self = this;

        self.list = {};
        self.current = null;

        log('chats', self);

        $rootScope.$on('new random chat', function(event, params) {
            if (params.type == 'internal'){
                self.current = self.getChat(params.channel);
                if (!self.current)
                    self.current = self.addChat({channel: params.channel});
            } else if (params.type == 'external')
                self.current = random.getExternalInstance();

            setTimeout(function() {
                router.openOnTop('chat');
            },1);

            //if (config('debugMode'))
            //    $location.search({chat: args.type + ':' + args.channel});
        });

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
            // storage.saveChats(self.list);
            // log("user chats are saved");
        };

        self.loadFromStorage = function() {
            return storage.getChats().then(function(dataFromStorage) {
                var _chats = {};
                for (var key in dataFromStorage) { 
                    _chats[key] = Chat.loadFromStorage(dataFromStorage[key], self);
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

        socket.on('typing', function(e) {
            if (e.channel == self.current.channel)
                $rootScope.$apply(function() {
                    $rootScope.notification.typing = e.value;
                });
        });

        self.setTypingStatus = function(value, channel, uuid) {
            socket.emit("typing",
                {channel: channel, uuid: uuid, value: value});
        };

    }
]);

