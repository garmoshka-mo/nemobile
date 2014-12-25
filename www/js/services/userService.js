services
.service('user', [
    '$timeout', 'storage', 'Chat', 'notification', 'api','$q', '$rootScope', 
    function($timeout, storage, Chat, notification, api, $q, $rootScope) {
    
    this.name = null;
    this.uuid = null;
    this.accessToken = null;
    this.channel = null;
    this.friends = {};
    this.chats = {};

    var user = this;
    
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
        user.uuid = userInfo.uuid

        user.subscribe(user.channel);
        localStorage.setItem('isLogged', true);
        user.save();
        user.saveFriends();
        setApiAccessToken();
    }

    function setApiAccessToken() {
        api.setAccessToken(user.accessToken);
    }

    function clearApiAccessToken() {
        api.clearAccessToken();
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

    this.clear = function() {
        this.name = null;
        this.uuid = null;
        this.accessToken = null;
        this.channel = null;
        this.friends = {};
        this.chats = {};
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
            self.subscribe();
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
    }

    this.save = function() {
        storage.saveUser(this);
    }

    this.saveFriends = function() {
        storage.saveFriends(this.friends)
    }

    this.saveChats = function() {
        storage.saveChats(this.chats);
    }

    this.isLogged = function() {
        return !!localStorage.getItem('isLogged')
    }

    this.subscribe = function() {
        var self = this;
        pubnub.subscribe({
            channel: self.channel,
            message: function handleMessage(m) {
                console.log("received new message", m);
                
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
                
                showNotification(self, m);
                lastSession.setTimer(m)
                lastSession.save();

                console.log("When chatSession expires: ", lastSession.whenExipires);
                $rootScope.$apply();
                console.log("income message", m)
                console.log(self);
            }
        })
    }

    

    this.unsubscribe = function() {
        pubnub.unsubscribe({
            channel: this.channel
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