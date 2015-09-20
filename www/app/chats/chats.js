angular.module("angServices")
.service('chats', ['$rootScope', 'apiRequest', 'deviceInfo', 'Chat',
        'storage', 'router',
    function($rootScope, apiRequest, deviceInfo,  Chat,
             storage, router) {
        
        var self = this;

        self.list = {};
        self.currentChatRoute = null;

        console.log('chats', self);

        self.getChat = function(channelName, senderId) {
            if (!_.isUndefined(channelName) && self.list[channelName]) {
                return self.list[channelName];
            }

            if (!_.isUndefined(senderId) && self.list[senderId]) {
                return self.list[senderId];
            }

            return false;
        };

        self.addChat = function(chatData) {
            if (chatData.channelName) {
                chatData.primaryKey = 'channelName';
                self.list[chatData.channelName] = new Chat(chatData);
                self.list[chatData.channelName].updateInfo();
                $rootScope.$broadcast('got new channel name', {channelName: chatData.channelName});
                self.save();
                return self.list[chatData.channelName];
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

        self.removeChat = function(channelName, senderUuid) {
            if (channelName) {
                pubnubSubscription.removeDeviceFromChannel(channelName);
            }
            var _chat = self.getChat(channelName, senderUuid);
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

        $rootScope.$on('new random chat', function(event, args) {
            var route = {fromState: 'random'};

            if (args.type == 'internal')
                route.channelName = args.channel;
            else
                route.chatType = 'external';

            router.goto('chat', route);
        });

        self.openCurrentChat = function() {
            if (!self.currentChatRoute) return;
            router.goto('chat', self.currentChatRoute);
        }

    }
]);

