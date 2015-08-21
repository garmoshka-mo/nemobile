services
.service('user', [
    '$timeout', 'storage', 'Chat', 'notification', 'api','$q', '$rootScope', '$http', 'stickersGallery', 'friendsList', '$sce', '$state', 'routing',
    function($timeout, storage, Chat, notification, api, $q, $rootScope, $http, stickersGallery, friendsList, $sce, $state, routing) {
    
    this.name = null;
    this.uuid = null;
    this.accessToken = null;
    this.channel = null;
    this.scores = null;
    this.chats = {};
    this.lastMessageTimestamp = null;
    this.friendsList = friendsList;
    this.isParsingFromStorageNow = false;
    this.parsedFromStorage = false;
    this.isVirtual = false;
    this.unreadChatsAmount = 0;


    var user = this;
    var differencePubnubDeviceTime;
    var isLogged = null;

    //private methods
    function handleOsNotificationClick (params) {
        location.href = params.href;
    }

    function showNotification(user, messageText, channelName, senderUuid) {
        var notificationText;
        
        if (user.friendsList.nepotomFriends[senderUuid]) {
            var friend = user.friendsList.nepotomFriends[senderUuid];
            var imgSrc = friend.photos[0].valueMini ? friend.photos[0].valueMini : 
                friend.photos[0].value;
            var image = "<img src='" + imgSrc + 
                "' class='chat-toolbar-image pointer'>";
            notificationText = image + friend.displayName;    
        }
        else {
            notificationText = "Новое сообщение";
        }

        
        notification.setTemporary(notificationText + ": " + messageText, 4000, function() {
            routing.goto('chat', {channelName: channelName});
        });
       
    }

    

    function handleSuccessSignIn(userInfo) {
        user.name = userInfo.name;
        user.channel = userInfo.channel_group_name;
        user.uuid = userInfo.uuid;
        user.scores = userInfo.score;
        user.phoneNumber = userInfo.phone_number;
        
        var avatarParseResult = user.parseAvatarDataFromServer(userInfo);
        console.log(avatarParseResult);
        user.avatarUrl = avatarParseResult.fullSize;
        user.avatarUrlMini = avatarParseResult.mini;

        user.subscribe(user.channel);
        isLogged = true;
        user.parsedFromStorage = true;
        localStorage.setItem('isLogged', true);
        getUserFriendsFromServer()
        .then(
            function() {
                // user.friendsList.updateNepotomFriendsInfo()
                // .then(function() {
                //     console.log("friends list is downloaded from server");
                //     $state.go($state.current, {}, {reload: true});
                // });
            }
        );
        user.save();
        stickersGallery.getCurrentUserCategories();
        registerDeviceToChannel();
    }

    function setAccessToken(accessToken) {
        user.accessToken = accessToken;
        api.setAccessToken(accessToken);
    }

    function clearApiAccessToken() {
        api.clearAccessToken();
    }

    function clearCurrentUser() {
        user.name = null;
        user.uuid = null;
        user.accessToken = null;
        user.channel = null;
        user.scores = null;
        user.friends = {};
        user.chats = {};
        user.lastMessageTimestamp = null;
        user.isVirtual = null;
        friendsList.clear();
    }

    function unsubscribe() {
        pubnub.unsubscribe({
            channel_group: user.channel
        });
    }

    function getUserFriendsFromServer() {
        var NOT_SENT_CHANGES_TO_SERVER = true;
        return api.getFriends()
        .then(function(res) {
            // deleting deleted friends
            var serverUuids = _.map(res.friends, 'uuid');
            var userFriendsUuids = _.map(user.friendsList.nepotomFriends, 'uuid');
            var deletedUuids = _.difference(userFriendsUuids, serverUuids);
            deletedUuids.forEach(function(uuid) {
                user.friendsList.removeFriend(user.friendsList.nepotomFriends[uuid], 
                    NOT_SENT_CHANGES_TO_SERVER);
            });
            //adding new one
            res.friends.forEach(function(friendData) {
                user.addFriend({
                    uuid: friendData.uuid,
                    name: friendData.display_name,
                    created: friendData.created_at,
                    avatarObj: user.parseAvatarDataFromServer(friendData)
                }, NOT_SENT_CHANGES_TO_SERVER);
            });
        });
    }

    function pushMessageToSession(lastSession, messageText, expires) {
        lastSession.messages.push({
            text: messageText,
            isOwn: false
        });

        if (!lastSession.isReplied) {
            if (lastSession.creatorId === self.uuid) {
                lastSession.setReplied();
            }
        }

        lastSession.setTimer(expires);
        lastSession.save();
    }

    function handleChatSessionAsync(chat, messageText, expires) {
        console.log('handle chat session async');
        chat.getLastUnexpiredChatSession()
        .then(
            function(lastSession) {
                pushMessageToSession(lastSession, messageText, expires);
            }
        );
    }

    function handleIncomeMessage(message, envelope) {
        console.log(message);
        var self = user;
        
        if (message.event == "contacts_updated") {
            console.log('friends list will be updated');
            getUserFriendsFromServer();
            return;        
        }
        
        if (message.event == "profile_updated") {
            console.log('user info will be updated');
            updateUserInfo(user.accessToken);
            return;        
        }

        var channelName = envelope[3];
        if (message.event == "chat_ready") {
            routing.goto('chat', {channelName: channelName});
            return;
        }

        //if previous ifs didn't work
        //therefore message is user_message
        var senderUuid = message.sender_uuid;
        var messageText = message.pn_apns.message;
        var messageTimestamp = parseInt((+envelope[1]/10000).toFixed(0));

        if (senderUuid == user.uuid) {
            return;
        }

        //getting the last unexpired chat session
        var lastSession;
        
        //checking if chat exist 
        var chat = self.getChat(channelName, senderUuid);
        if (chat) {
            // console.log("added to existing chat");
            
            //if chat session exists 
            if (!chat.isExpired) {
                if (chat.lastMessageTimestamp >= messageTimestamp) {
                    return;
                }
                
                if (!chat.lastUnexpiredChatSession) {
                    //it is necessary because some chat session is stored in 
                    //local memory and it takes time to get them from there
                    //that's why there is async handling 
                    handleChatSessionAsync(chat, messageText, message.expires);
                }
                else {
                    lastSession = chat.lastUnexpiredChatSession;
                }
            }
            //if chat session exists but expired
            else {
                chat.addChatSession(senderUuid, channelName, senderUuid);
                chat.getLastUnexpiredChatSession(); 
                lastSession = chat.lastUnexpiredChatSession;
            } 
        }
        else {
            // console.log("created new chat");
            chat = self.addChat({channelName: channelName, senderId: senderUuid});
            chat.addChatSession(senderUuid, channelName, senderUuid);
            chat.getLastUnexpiredChatSession(); 
            lastSession = chat.lastUnexpiredChatSession;
        }

        if (messageText === "$===real===") {
            self.chats[senderUuid].isVirtual = false;
            messageText = "<span class='text-bold'>пользователь зарегистрировался</span>";
            // messageText = $sce.trustAsHtml(messageText);
        }

        if (lastSession) {
            pushMessageToSession(lastSession, messageText, message.expires);
        }

        //filling sender uuid if it is undefined
        if (senderUuid) {
            if (!chat.senderId) {
                chat.senderId = senderUuid;
                chat.updateInfo(true);
            } 
        }

        //filling channel name if it is undefined
        if (!chat.channelName) {
            chat.channelName = channelName;
        }

        self.scores = message.my_score;
        chat.senderScores = message.his_score;
        chat.lastMessageTimestamp = messageTimestamp;
        
        //todo: check the correct work of self.lastMessageTimestamp
        self.lastMessageTimestamp = new Date().getTime();
        self.saveLastMessageTimestamp();

        if (!($state.params.channelName == channelName || $state.params.senderId == senderUuid)) {
            showNotification(self, messageText, channelName, senderUuid);
            chat.isRead = false;
            self.countUnreadChats();
        }
        
        user.saveChats();

        // console.log("When chatSession expires: ", lastSession.whenExipires);
        // console.log("income message", m);
        // console.log(self);
        $rootScope.$broadcast('messageCame');
        $rootScope.$apply();
    }

    function getPubnubTimeDifference() {
        var d = $q.defer();
        pubnub.time(function(time) {
            differencePubnubDeviceTime = time / 10000 - new Date().getTime();
            console.log("difference between pubnub and device time: ", differencePubnubDeviceTime);
            d.resolve(differencePubnubDeviceTime);
        });
        return d.promise;
    }

    function getGroupChannels() {
        var d = $q.defer();
        
        pubnub.channel_group_list_channels({
            channel_group: user.channel,
            callback: function(res) {
                d.resolve(res.channels);
            }
        });

        return d.promise;
    }

    function getChannelHistory(channel) {
        var d = $q.defer();

        var MSEC_IN_MONTH = 30 * 24 * 3600 * 1000;
        
        var end;
        if (user.lastMessageTimestamp) {
            end = user.lastMessageTimestamp * 10000;
        }
        else {
            end = MSEC_IN_MONTH * 1000; 
        }

        pubnub.history(
            {
                channel: channel,
                end: end,
                callback: function(res) {
                    console.log("unseen messages: ", res);
                    d.resolve(res);
                },
                include_token: true 
            }
        );

        return d.promise;
    }

    function handleChannelHistory(messages, channel) {
        
        for (var j = 0; j < messages.length; j++) {
            handleIncomeMessage(messages[j].message, [null, messages[j].timetoken, null, channel]);                            
        }

        if (window.goToLastMessageChat) {
            location.href = "#/chat?senderId=" + messages[messages.length - 1].sender_uuid;
        }

        console.log('while you were away', messages);
        
        window.isGotUnseenMessage = true;
    }

    function getUnseenMessages() {
        var d = $q.defer();
        
        if (user.lastMessageTimestamp || user.isVirtual) {
            // console.log("last seen message timestamp * 10000: ", 
            //     (user.lastMessageTimestamp * 10000).toString());
            
            getGroupChannels()
            .then(
                function(channels) {
                    var channelsHistoriesPromises = [];

                    // console.log('channels were got', channels);
                    
                    var _promise = channels.forEach(function(channel) {
                        getChannelHistory(channel)
                        .then(
                            function(res) {
                                handleChannelHistory(res[0], channel);
                            }
                        );
                        channelsHistoriesPromises.push(_promise);
                    });

                    return channelsHistoriesPromises;
                }
            )
            .then(function(historiesPromises) {
                $q.all(historiesPromises)
                .then(function(res) {
                    d.resolve();
                });
            });
        }
        else {
            d.reject();
        }

        return d.promise;
    }

    // function getMessagesForVirtualChat() {
    //     // console.log("last seen message timestamp * 10000: ", 
    //     //     (user.lastMessageTimestamp * 10000).toString());
    //     var MSEC_IN_MONTH = 30 * 24 * 3600 * 1000;


    //     pubnub.history(
    //         {
    //             channel: user.channel,
    //             end: MSEC_IN_MONTH * 10000,
    //             callback: function(res) {
    //                 console.log("unseen messages: ", res);
    //                 var messages = res[0];
    //                 for (var i = 0; i < messages.length; i++) {
    //                     handleIncomeMessage(messages[i]);
    //                 }

    //                 if (messages.length) {
    //                     console.log("redirected to chat");
    //                     location.href = "#/chat?senderId=" + messages[messages.length - 1].sender_uuid;
    //                 }
    //             }
    //         }
    //     );
    // }

    function removeDeviceFromChannel() {
        if (window.deviceId) {
            var type = device.platform === "iOS" ? "apns" : "gcm";
            var url = "http://pubsub.pubnub.com/v1/push/sub-key/"
                + App.Settings.pubnubSubscribeKey  + "/devices/" 
                + window.deviceId + "/remove?type=" + type;
            $http.get(url).then(
                function(res) {
                    console.log(res);
                },
                function(res) {
                    console.log(res);
                }
            );
        }
    }

    function updateUserInfo(accessToken) {
        var at = accessToken ? accessToken : user.accessToken;
        user.signin(null, null, at);
        console.log('user info is updated');
    }


    function notifyThatBecomeReal() {
        var realMessage = "$===real===";
        var ONE_DAY_MSEC = 24 * 3600 * 1000;
        for (senderId in user.chats) {
            if (!user.chats[senderId].isExpired) {
                var chat = user.chats[senderId];
                chat.getLastUnexpiredChatSession();
                chat.lastUnexpiredChatSession.sendMessage(realMessage, senderId, ONE_DAY_MSEC);
            }
        }
    }

    window.registerDeviceToChannel = function registerDeviceToChannel() {
        if (window.deviceId) {
            var type = device.platform === "iOS" ? "apns" : "gcm";
            var url = "http://pubsub.pubnub.com/v1/push/sub-key/"
                + App.Settings.pubnubSubscribeKey  + "/devices/" 
                + window.deviceId + "?add=" + user.channel
                + "&type=" + type;

            $http.get(url).then(
                function(res) {
                    console.log("device is registered to user's channel", res);
                },
                function(res) {
                    console.log("register device error", res);
                }
            );
        }
        else {
            console.warn("device id is undefined");
        }     
    };

    //public methods
    this.signin = function(name, password, accessToken, isVirtual) {
        var self = this;

        function getUserInfo(accessToken) {
            return api.getUserInfo(accessToken)
            .then(
                function(userInfo) {
                    // console.log('userInfo', userInfo);
                    user.isVirtual = isVirtual ? true : false;
                    handleSuccessSignIn(userInfo);
                    console.log("user is logged", user);
                },
                function(res) {
                    console.error("sign in fail");
                    return $q.reject(res);
                }
            );
        }

        if (accessToken) {
            setAccessToken(accessToken);
            return getUserInfo(self.accessToken);
        }
        else {
            return api.signin(name, password)
            .then(
                function setAccesssToken(res) {
                    setAccessToken(res.accessToken);
                },
                function showError(res) {
                    return $q.reject(res.errorDescription); 
                }
            )
            .then(
                function() {
                    getUserInfo(self.accessToken);    
                },
                function(res) {
                    return $q.reject(res);
                }
            );
        }
    };

    this.signup = function(name, password) {
        return api.signup(name, password)
        .then(
            function(res) {
                return res;
            },
            function(res) {
                return $q.reject(res.errorDescription);
            }
        );
    };

    this.logout = function() {
        var d = $q.defer();
        $timeout(function() {
            isLogged = false;
            storage.clear();
            unsubscribe();
            clearCurrentUser();
            clearApiAccessToken();
            removeDeviceFromChannel();
            d.resolve();
            console.log('user is logged out', user);
        }, 0);
        return d.promise;
    };

    this.getUnseenMessages = function() {
        if (differencePubnubDeviceTime) {
            return getUnseenMessages();
        }
        else {
            var d = $q.defer();

            getPubnubTimeDifference()
            .then(function() {
                getUnseenMessages()
                .then(
                    function() {
                        d.resolve();
                    }
                );
            });

            return d.promise;
        }        
    };

    this.addFriend = function(fields, notSaveOnServer) {
        var photos = fields.avatarObj ? 
            [{value: fields.avatarObj.fullSize, valueMini: fields.avatarObj.mini}] : null;
        var emails = fields.email ? 
            [{value: fields.email}] : null;
        var phoneNumbers = fields.phoneNumber ? 
            [{value: phoneNumber}] : null;
        var data = {
            displayName: fields.name,
            uuid: fields.uuid,
            photos: photos,
            created: fields.created ? fields.created : null,
            emails: emails,
            phoneNumbers: phoneNumbers
        };
        friendsList.addFriend(data, notSaveOnServer);
    };

    this.addChat = function(chatData) {
        chatData.currentUser = this;

        if (chatData.channelName) {
            chatData.primaryKey = 'channelName';
            this.chats[chatData.channelName] = new Chat(chatData);
            this.chats[chatData.channelName].updateInfo();
            return this.chats[chatData.channelName];
        }

        if (chatData.senderId) {
            chatData.primaryKey = 'senderId';
            this.chats[chatData.senderId] = new Chat(chatData);
            this.chats[chatData.senderId].updateInfo();
            return this.chats[chatData.senderId];
        }
    };

    this.getChat = function(channelName, senderId) {
        if (user.chats[channelName]) {
            return user.chats[channelName];
        }

        if (user.chats[senderId]) {
            return user.chats[senderId];
        }

        return false;
    };

    this.removeChat = function(senderUuid) {
        this.chats = _.omit(this.chats, senderUuid);
        this.saveChats();    
    }; 
   
    this.parseFromStorage = function() {
        var self = this;
        self.isParsingFromStorageNow = true;
        this.parsedFromStoragePromise = $q.all([
            storage.getUser().then(function(dataFromStorage) {
                self.name = dataFromStorage.name;
                self.uuid = dataFromStorage.uuid;
                self.channel = dataFromStorage.channel;
                self.scores = dataFromStorage.scores;
                self.phoneNumber = dataFromStorage.phoneNumber;
                self.lastReadMessageTimestamp = dataFromStorage.lastReadMessageTimestamp;
                self.avatarUrl = dataFromStorage.avatarUrl;
                self.avatarUrlMini = dataFromStorage.avatarUrlMini;
                self.isVirtual = dataFromStorage.isVirtual;

                setAccessToken(dataFromStorage.accessToken);
                self.subscribe();
                registerDeviceToChannel();
                stickersGallery.getCurrentUserCategories();
                console.log("user info is taken from storage", self);
            }),

            storage.getChats().then(function(dataFromStorage) {
                var _chats = {};
                for (var key in dataFromStorage) { 
                    _chats[key] = Chat.parseFromStorage(dataFromStorage[key], self);
                }
                self.chats = _chats;
                
                self.countUnreadChats();
                console.log("user chats are taken from storage", user.chats);
            }),

            storage.getLastMessageTimestamp().then(function(timestamp) {
                self.lastMessageTimestamp = timestamp;
                self.getUnseenMessages();
            }),

            storage.getFriendsList().then(function(dataFromStorage){
                friendsList.parseFromStorage(dataFromStorage);
                self.friendsList = friendsList;
                console.log("user's friends list is taken from storage");
            })
        ])
        .then(
            function() {
                self.isParsingFromStorageNow = false;
                self.parsedFromStorage = true;
                console.log("all user info was parsed from storage");
            },
            function() {
                console.warn("there was error while parsing");
            }
        );

        return this.parsedFromStoragePromise;
    };

    this.save = function() {
        storage.saveUser(this);
        console.log("user info is saved");
    };

    this.saveChats = function() {
        storage.saveChats(this.chats);
        console.log("user chats are saved");
    };

    this.saveLastMessageTimestamp = function() {
        storage.saveLastMessageTimestamp(this.lastMessageTimestamp); 
    };

    this.isLogged = function() {
        if (isLogged === null) {
            isLogged = !!localStorage.getItem('isLogged');
            return isLogged;
        }
        else {
            return isLogged;
        }
    };

    this.subscribe = function() {
        var self = this;
        pubnub.subscribe({
            channel_group: self.channel,
            message: function(message, envelope, channelName) {
                console.log(message, envelope);
                handleIncomeMessage(message, envelope);
            }
        });
        
    };

    this.initRegistrationWithPhone = function(phoneNumber) {
        return  api.initPhoneActivation(phoneNumber);
    };

    this.attachPhoneNumber = function(phoneNumber) {
        return api.attachPhoneNumber(phoneNumber);
    };
 
    this.confirmPhoneNumber = function(phoneNumber, activationCode, sendAccessToken) {
        var self = this;
        return api.confirmPhoneNumber(phoneNumber, activationCode, sendAccessToken)
        .then(
            function(res) {
                updateUserInfo(res.access_token);    
            },
            function(res) {
                return $q.reject(res);
            }
        );
    };

    this.updateAvatarURL = function(url) {
        return api.updateAvatarText({url: url})
        .then(
            function() {
                updateUserInfo();
            },
            function() {
                console.log("updating avatar is failed");
                return $q.reject();
            }
        );
    };

    this.updateAvatarGuid = function(guid) {
        return api.updateAvatarText({guid: guid})
        .then(
            function() {
                updateUserInfo();
            },
            function() {
                console.log("updating avatar is failed");
                return $q.reject();
            }
        );
    };

    this.updateAvatarFile = function(file) {
        return api.updateAvatarFile(file)
        .then(
            function () {
                updateUserInfo();
            },
            function () {
                console.error("image upload error");
                return $q.reject();
            }
        );
    };

    this.blockUser = function(uuid) {
        api.blockUser(uuid);
    };

    this.forbidImage = function(imageUrl) {
        api.forbidImage(imageUrl);
    };

    this.updateProfile = function(name, password) {
        return api.updateProfile(name, password)
        .then(
            function(res) {
                updateUserInfo();
                if (user.isVirtual) {
                    user.isVirtual = false;
                    notifyThatBecomeReal();
                }
                console.log('updateProfile', res);
            },
            function(res) {
                return $q.reject(res);
            }
        );
    };


    this.parseAvatarDataFromServer = function(dataFromServer) {
        var output = {
            fullSize: null,
            mini: null, 
        };

        if (dataFromServer.avatar_url) {
            output.fullSize = dataFromServer.avatar_url;
            output.mini =  dataFromServer.avatar_url.replace(/(upload\/)([a-z0-9]*)(\/)/, '$1' + 'w_80/$2' + '$3');
        }
        else if (dataFromServer.avatar_guid) {
            output.fullSize = App.Settings.adorableUrl + '/' + dataFromServer.avatar_guid;
            output.mini = App.Settings.adorableUrl + '/40/' + dataFromServer.avatar_guid;
        }
        else if (dataFromServer.uuid) {
            output.fullSize = App.Settings.adorableUrl + '/' + dataFromServer.uuid;
            output.mini = App.Settings.adorableUrl + '/40/' + dataFromServer.uuid;
        }
        else {
            output.fullSize = App.Settings.adorableUrl + '/' + Math.round(Math.random() * 1000);
            output.mini = App.Settings.adorableUrl + '/40/' + Math.round(Math.random() * 1000);
        }

        return output;
    };

    this.socialSignin = function(provider, providerId, providerToken) {
        return api.socialSignin.apply(this, arguments)
        .then(function(res) {
            updateUserInfo(res.access_token);
        });
    };

    this.signinAsVirtualUser = function () {
        return api.addVirtualAccount()
        .then(
            function(res) {
                user.signin(null, null, res.access_token, true)
                .then(
                    function() {
                        user.save();
                    },
                    function() {
                        return $q.reject();
                    }
                );
            }
        );
    };

    var pubnub = PUBNUB.init({
        subscribe_key: App.Settings.pubnubSubscribeKey,
        publish_key: "pub-c-d0b8d15b-ee39-4421-b5c9-cf6e4c8b3226"
    });



    // if (this.isLogged()) {
    //     this.parseFromStorage();
    //     console.log("user data is taken from storage");
    // }

    //function for testing purposes
    this.pubnubPublish = function() {
        pubnub.publish({
            channel: user.channel,
            message: {
                text: "ale!",
                pn_gcm: {
                    data: {
                        uuid: user.uuid,
                        message: "ale"
                    }
                }
            }
        });
    };

    this.countUnreadChats = function() {
        this.unreadChatsAmount = 0;
        for (var chat in this.chats) {
            if (!this.chats[chat].isRead && !this.chats[chat].isExpired) {
                this.unreadChatsAmount++;
            }
        }
        console.log('unread chats is counted', this.unreadChatsAmount);
    };

    //for debugging
    window.user = this;

}]);