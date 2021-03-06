angular.module("angServices")
.service('chats', ['$rootScope', 'deviceInfo', 'Chat', 'socket',
        'storage', 'router', 'notification',
    function($rootScope, deviceInfo,  Chat, socket,
             storage, router, notification) {
        
        var self = this,
            current = null; // Keep current chat in private var. Sensitive logic of setting

        self.list = {};
        self.disconnectWithoutFeedback = false;


        log('chats', self);

        self.newRandomExternal = function(c) {
            setCurrentChat(c);
        };

        self.newRandomInternal = function(channel, myIdx, partner) {
            var chat = self.getChat(channel);
            if (!chat)
                chat = self.addChat({channel: channel, myIdx: myIdx, partner: partner});
            setCurrentChat(chat);
        };

        function setCurrentChat(chat) {
            if (current)
                return console.error('Attempt to overwrite current chat', current, chat);

            current = chat;
            notification.suppressOnFocus = true;
            setTimeout(function() { router.changeChatState('chat'); },1);
        }

        self.getCurrent = function() {
            return current;
        };

        self.unsetCurrent = function() {
            current = null;
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
            chatData.primaryKey = 'channel';
            self.list[chatData.channel] = new Chat(chatData);
            self.list[chatData.channel].updateInfo();
            self.save();
            return self.list[chatData.channel];
        };

        self.save = function() {
            storage.saveChats(self);
            log("user chats are saved");
        };
        $rootScope.$watch(function(){return self.disconnectWithoutFeedback;}, self.save);

        self.loadFromStorage = function() {
            return storage.getChats().then(function(dataFromStorage) {
                if (dataFromStorage) {
                    self.disconnectWithoutFeedback = _.isUndefined(dataFromStorage.disconnectWithoutFeedback) ?
                        false : dataFromStorage.disconnectWithoutFeedback;
                    log("user chats are taken from storage", self.list);
                }
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
            if (current && current.channel == e.channel)
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

