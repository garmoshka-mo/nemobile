services
.service('user', [
    '$timeout', 'storage', 'Chat', 'notification', 'api','$q', '$rootScope', 
    function($timeout, storage, Chat, notification, api, $q, $rootScope) {
    
    this.name = null;
    this.uuid = null;
    this.accessToken = null;
    this.channel = null;
    this.scores = null;
    this.friends = {};
    this.chats = {};
    this.lastMessageTimestamp = null;

    var user = this;
    var differencePubnubDeviceTime;

    //private methods
    function handleOsNotificationClick (params) {
        location.href = params.href;
    }

    function showNotification(user, message) {
        var notificationText;
        var m = message;
        
        if (user.friends[m.sender_uuid]) {
            notificationText = user.friends[m.sender_uuid].name;    
        }
        else {
            notificationText = "Новое сообщение";
        }

        if ($rootScope.isAppInBackground) {
            notification.setOSNotification(m.message_text, notificationText, {"href": "#/chat/" + m.sender_uuid},
            handleOsNotificationClick);
        }
        else {
            notification.setTemporary(notificationText + ": " + m.message_text, 4000, function() {
                location.href = "#/chat/" + m.sender_uuid;
            })
        }
    }

    function handleSuccessSignIn(userInfo) {
        user.name = userInfo.name;
        user.channel = userInfo.channel_name;
        user.uuid = userInfo.uuid;
        user.scores = userInfo.score;

        user.subscribe(user.channel);
        localStorage.setItem('isLogged', true);
        user.save();
        user.saveFriends();
        setApiAccessToken();
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
    }

    function unsubscribe() {
        pubnub.unsubscribe({
            channel: user.channel
        })
    }

    function handleIncomeMessage(m) {
        var self = user;
        if (self.chats[m.sender_uuid]) {
            console.log("added to existing chat")
            self.chats[m.sender_uuid].getLastUnexpiredChatSession(); 
            var lastSession;
            
            if (!self.chats[m.sender_uuid].isExpired) {
                lastSession = self.chats[m.sender_uuid].lastUnexpiredChatSession;
            }
            else {
                self.chats[m.sender_uuid].addChatSession(m.sender_uuid, m.sender_uuid);
                self.chats[m.sender_uuid].getLastUnexpiredChatSession(); 
                lastSession = self.chats[m.sender_uuid].lastUnexpiredChatSession;
            } 
           
            if (!lastSession.isReplied) {
                if (lastSession.creatorId == self.uuid) {
                    lastSession.isReplied = true;
                }
            }

            lastSession.messages.push({
                text: m.message_text,
                isOwn: false
            });
        }
        else {
            console.log("created new chat")
            self.addChat(m.sender_uuid)
            self.chats[m.sender_uuid].addChatSession(m.sender_uuid, m.sender_uuid)
            self.chats[m.sender_uuid].getLastUnexpiredChatSession(); 
            var lastSession = self.chats[m.sender_uuid].lastUnexpiredChatSession;
            lastSession.messages.push(
                {
                    text: m.message_text,
                    isOwn: false
                }
            );
        }

        self.scores = m.my_score;
        self.chats[m.sender_uuid].senderScores = m.his_score;
        self.lastMessageTimestamp = new Date().getTime();
        self.saveLastMessageTimestamp();

        showNotification(self, m);
        lastSession.setTimer(m)
        lastSession.save();

        console.log("When chatSession expires: ", lastSession.whenExipires);
        $rootScope.$apply();
        console.log("income message", m)
        console.log(self);
    }

    function getPubnubTimeDifference() {
        var d = $q.defer();
        pubnub.time(function(time) {
            differencePubnubDeviceTime = time / 10000 - new Date().getTime();
            console.log("difference between pubnub and device time: ", differencePubnubDeviceTime);
            d.resolve(differencePubnubDeviceTime);
        })
        return d.promise;
    }

    function getUnseenMessages() {
        if (user.lastMessageTimestamp) {
            console.log("last seen message timestamp * 10000: ", 
                ((user.lastMessageTimestamp + differencePubnubDeviceTime) * 10000).toString());
            pubnub.history(
                {
                    channel: user.channel,
                    end: user.lastMessageTimestamp * 10000,
                    callback: function(res) {
                        console.log("unseen messages: ", res);
                        var messages = res[0];
                        for (var i = 0; i < messages.length; i++) {
                            handleIncomeMessage(messages[i]);                            
                        }
                    }
                }
            );
        }
    }

    window.registerDeviceToChannel = function registerDeviceToChannel() {
        if (window.deviceId) {
            console.log("deviceId", window.deviceId); 
            pubnub.mobile_gw_provision({
                device_id: window.deviceId,
                channel: user.channel,
                op: 'add',
                gw_type: 'gcm',
                error: function(msg) {
                    console.log("device is not registered", msg)
                },
                success: function(msg) {
                    console.log("device is registered", msg)
                } 
            })
        }
        else {
            console.error("device id is undefined")
        }
    }

    //public methods
    this.signin = function(name, password) {
        var self = this;
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
                api.getUserInfo(self.accessToken)
                .then(
                    function(userInfo) {
                        handleSuccessSignIn(userInfo);
                        console.log("user is logged", user);
                    },
                    function(res) {
                        console.error("sign in fail");
                        return $q.reject(res);
                    }
                )
            },
            function(res) {
                return $q.reject(res);
            }
        )
    }

    

    this.signup = function(name, password) {
        return api.signup(name, password)
        .then(
            function(res) {
                return res;
            },
            function(res) {
                return $q.reject(res.errorDescription);
            }
        )
    }

    this.logout = function() {
        storage.clear();
        unsubscribe();
        clearCurrentUser();
        console.log('user is logged out', user);
    }

    this.getUnseenMessages = function() {
        if (differencePubnubDeviceTime) {
            getUnseenMessages();
        }
        else {
            getPubnubTimeDifference()
            .then(function() {
                getUnseenMessages();
            })
        }        
    }

    this.addFriend = function(uuid, name) {
        this.friends[uuid] = {name: name};
        this.saveFriends();
    },

    this.addChat = function(senderId) {
        this.chats[senderId] = new Chat(senderId, this);
        this.saveChats()
    }
   
    this.parseFromStorage = function() {
        var self = this;

        storage.getUser().then(function(dataFromStorage) {
            self.accessToken = dataFromStorage.accessToken;
            self.name = dataFromStorage.name;
            self.uuid = dataFromStorage.uuid;
            self.channel = dataFromStorage.channel;
            self.scores = dataFromStorage.scores;
            self.lastReadMessageTimestamp = dataFromStorage.lastReadMessageTimestamp;
            self.subscribe();
            registerDeviceToChannel();
            setApiAccessToken();
            console.log("user info is taken from storage", self);
        })

        storage.getChats().then(function(dataFromStorage) {
            var _chats = {};
            for (var key in dataFromStorage) { 
                _chats[key] = Chat.parseFromStorage(dataFromStorage[key], self);
            }
            self.chats = _chats;
            console.log("user chats is taken from storage", user.chats);
        })

        storage.getFriends().then(function(dataFromStorage) {
            self.friends = dataFromStorage;
            console.log("user friends is taken from storage", user.friends);
        })

        storage.getLastMessageTimestamp().then(function(timestamp) {
            self.lastMessageTimestamp = timestamp;
            self.getUnseenMessages()
        })
    }

    this.save = function() {
        storage.saveUser(this);
        console.log("user info is saved");
    }

    this.saveFriends = function() {
        storage.saveFriends(this.friends)
        console.log("user friends is saved");
    }

    this.saveChats = function() {
        storage.saveChats(this.chats);
        console.log("user chats is saved");
    }

    this.saveLastMessageTimestamp = function() {
        storage.saveLastMessageTimestamp(this.lastMessageTimestamp); 
    }

    this.isLogged = function() {
        return !!localStorage.getItem('isLogged')
    }

    this.subscribe = function() {
        var self = this;
        pubnub.subscribe({
            channel: self.channel,
            message: function(m) { handleIncomeMessage(m) }
        })

        
    }

    var pubnub = PUBNUB.init({
        subscribe_key: App.Settings.pubnubSubscribeKey
    })



    if (this.isLogged()) {
        this.parseFromStorage();
        console.log("user data is taken from storage");
    }

}])