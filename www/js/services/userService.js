services
.service('user', [
    '$timeout', 'storage', 'Chat', 'notification', 'api','$q', '$rootScope', '$http', 'stickersGallery', 'friendsList', 
    function($timeout, storage, Chat, notification, api, $q, $rootScope, $http, stickersGallery, friendsList) {
    
    this.name = null;
    this.uuid = null;
    this.accessToken = null;
    this.channel = null;
    this.scores = null;
    this.chats = {};
    this.lastMessageTimestamp = null;
    this.friendsList = friendsList;

    var user = this;
    var differencePubnubDeviceTime;

    //private methods
    function handleOsNotificationClick (params) {
        location.href = params.href;
    }

    function showNotification(user, messageText, senderUuid) {
        var notificationText;
        
        if (user.friendsList.nepotomFriends[senderUuid]) {
            notificationText = user.friendsList.nepotomFriends[senderUuid].displayName;    
        }
        else {
            notificationText = "Новое сообщение";
        }

        
        notification.setTemporary(notificationText + ": " + messageText, 4000, function() {
            location.href = "#/chat?senderId=" + senderUuid;
        });
       
    }

    function handleSuccessSignIn(userInfo) {
        user.name = userInfo.name;
        user.channel = userInfo.channel_name;
        user.uuid = userInfo.uuid;
        user.scores = userInfo.score;
        user.phoneNumber = userInfo.phone_number;

        user.subscribe(user.channel);
        localStorage.setItem('isLogged', true);
        user.save();
        user.saveFriends();
        setApiAccessToken();
        stickersGallery.getCurrentUserCategories();
        registerDeviceToChannel();
    }

    function setApiAccessToken() {
        api.setAccessToken(user.accessToken);
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
        friendsList.clear();
    }

    function unsubscribe() {
        pubnub.unsubscribe({
            channel: user.channel
        });
    }

    function handleIncomeMessage(m) {
        var self = user;
        var senderUuid = m.pn_gcm.data.uuid;
        var messageText = m.pn_gcm.data.message;

        if (senderUuid === "system") {
            updateUserInfo(user.accessToken);
        }

        if (self.chats[senderUuid]) {
            console.log("added to existing chat");
            self.chats[senderUuid].getLastUnexpiredChatSession(); 
            var lastSession;
            
            if (!self.chats[senderUuid].isExpired) {
                lastSession = self.chats[senderUuid].lastUnexpiredChatSession;
            }
            else {
                self.chats[senderUuid].addChatSession(senderUuid, senderUuid);
                self.chats[senderUuid].getLastUnexpiredChatSession(); 
                lastSession = self.chats[senderUuid].lastUnexpiredChatSession;
            } 
           
            if (!lastSession.isReplied) {
                if (lastSession.creatorId === self.uuid) {
                    lastSession.setReplied();
                }
            }

            lastSession.messages.push({
                text: messageText,
                isOwn: false
            });
        }
        else {
            console.log("created new chat");
            self.addChat(senderUuid);
            self.chats[senderUuid].addChatSession(senderUuid, senderUuid);
            self.chats[senderUuid].getLastUnexpiredChatSession(); 
            var lastSession = self.chats[senderUuid].lastUnexpiredChatSession;
            lastSession.messages.push(
                {
                    text: messageText,
                    isOwn: false
                }
            );
        }

        self.scores = m.my_score;
        self.chats[senderUuid].senderScores = m.his_score;
        self.chats[senderUuid].isRead = false;
        self.lastMessageTimestamp = new Date().getTime();
        self.saveLastMessageTimestamp();

        showNotification(self, messageText, senderUuid);
        lastSession.setTimer(m.expires);
        lastSession.save();

        console.log("When chatSession expires: ", lastSession.whenExipires);
        console.log("income message", m);
        console.log(self);
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

    function getUnseenMessages() {
        if (user.lastMessageTimestamp) {
            console.log("last seen message timestamp * 10000: ", 
                (user.lastMessageTimestamp * 10000).toString());
            pubnub.history(
                {
                    channel: user.channel,
                    end: (user.lastMessageTimestamp + differencePubnubDeviceTime) * 10000,
                    callback: function(res) {
                        console.log("unseen messages: ", res);
                        var messages = res[0];
                        for (var i = 0; i < messages.length; i++) {
                            handleIncomeMessage(messages[i]);                            
                        }
                        if (window.goToLastMessageChat) {
                            location.href = "#/chat?senderId=" + messages[messages.length - 1].sender_uuid;
                        }

                        window.isGotUnseenMessage = true;
                    }
                }
            );
        }
    }

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
        user.signin(null, null, accessToken);
        console.log('user info is updated');
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
            console.error("device id is undefined");
        }     
    };

    //public methods
    this.signin = function(name, password, accessToken) {
        var self = this;

        function getUserInfo(accessToken) {
            api.getUserInfo(accessToken)
            .then(
                function(userInfo) {
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
            self.accessToken = accessToken;
            getUserInfo(self.accessToken);
        }
        else {
            return api.signin(name, password)
            .then(
                function setAccesssToken(res) {
                    self.accessToken = res.accessToken;
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
        storage.clear();
        unsubscribe();
        clearCurrentUser();
        removeDeviceFromChannel();
        console.log('user is logged out', user);
    };

    this.getUnseenMessages = function() {
        if (differencePubnubDeviceTime) {
            getUnseenMessages();
        }
        else {
            getPubnubTimeDifference()
            .then(function() {
                getUnseenMessages();
            });
        }        
    };

    this.addFriend = function(uuid, name) {
        var data = {
            name: {
                formatted: name
            },
            uuid: uuid
        };
        friendsList.addFriend(data);
    },

    this.addChat = function(senderId) {
        this.chats[senderId] = new Chat(senderId, this);
        this.chats[senderId].updateChatTitle();
    };
   
    this.parseFromStorage = function() {
        var self = this;

        storage.getUser().then(function(dataFromStorage) {
            self.accessToken = dataFromStorage.accessToken;
            self.name = dataFromStorage.name;
            self.uuid = dataFromStorage.uuid;
            self.channel = dataFromStorage.channel;
            self.scores = dataFromStorage.scores;
            self.phoneNumber = dataFromStorage.phoneNumber;
            self.lastReadMessageTimestamp = dataFromStorage.lastReadMessageTimestamp;
            self.subscribe();
            registerDeviceToChannel();
            setApiAccessToken();
            stickersGallery.getCurrentUserCategories();
            console.log("user info is taken from storage", self);
        });

        storage.getChats().then(function(dataFromStorage) {
            var _chats = {};
            for (var key in dataFromStorage) { 
                _chats[key] = Chat.parseFromStorage(dataFromStorage[key], self);
            }
            self.chats = _chats;
            console.log("user chats are taken from storage", user.chats);
        });

        storage.getLastMessageTimestamp().then(function(timestamp) {
            self.lastMessageTimestamp = timestamp;
            self.getUnseenMessages();
        });

        storage.getFriendsList().then(function(dataFromStorage){
            friendsList.parseFromStorage(dataFromStorage);
            self.friendsList = friendsList;
            console.log("user's friends list is taken from storage");
        });
    };

    this.save = function() {
        storage.saveUser(this);
        console.log("user info is saved");
    };

    this.saveFriends = function() {
        storage.saveFriends(this.friends);
        console.log("user friends is saved");
    };

    this.saveChats = function() {
        storage.saveChats(this.chats);
        console.log("user chats are saved");
    };

    this.saveLastMessageTimestamp = function() {
        storage.saveLastMessageTimestamp(this.lastMessageTimestamp); 
    };

    this.isLogged = function() {
        return !!localStorage.getItem('isLogged');
    };

    this.subscribe = function() {
        var self = this;
        pubnub.subscribe({
            channel: self.channel,
            message: function(m) {handleIncomeMessage(m);}
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
    } ;

    var pubnub = PUBNUB.init({
        subscribe_key: App.Settings.pubnubSubscribeKey
    });



    if (this.isLogged()) {
        this.parseFromStorage();
        console.log("user data is taken from storage");
    }

}]);