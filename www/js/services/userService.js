services
.service('user', [
    '$timeout', 'storage', 'Chat', 'notification', 'api','$q', '$rootScope', '$http', 'stickersGallery', 'friendsList', '$sce', '$state',
    function($timeout, storage, Chat, notification, api, $q, $rootScope, $http, stickersGallery, friendsList, $sce, $state) {
    
    this.name = null;
    this.uuid = null;
    this.accessToken = null;
    this.channel = null;
    this.scores = null;
    this.chats = {};
    this.lastMessageTimestamp = null;
    this.friendsList = friendsList;
    this.isParsingFromStorageNow = false;
    this.isVirtual = false;

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
        
        var avatarParseResult = user.parseAvatarDataFromServer(userInfo);
        user.avatarUrl = avatarParseResult.fullSize;
        user.avatarUrlMini = avatarParseResult.mini;

        if (user.isVirtual) {
            getMessagesForVirtualChat();
        }

        user.subscribe(user.channel);
        localStorage.setItem('isLogged', true);
        getUserFriendsFromServer()
        .then(
            function() {
                user.friendsList.updateNepotomFriendsInfo()
                .then(function() {
                    console.log("friends list is downloaded from server");
                    $state.go($state.current, {}, {reload: true});
                });
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
        friendsList.clear();
    }

    function unsubscribe() {
        pubnub.unsubscribe({
            channel: user.channel
        });
    }

    function getUserFriendsFromServer() {
        return api.getFriends()
        .then(function(res) {
            res.friends.forEach(function(friendData) {
                user.addFriend({
                    uuid: friendData.uuid,
                    name: friendData.display_name,
                    created: friendData.created_at,
                    email: friendData.email,
                    phoneNumber: friendData.phoneNumber
                });
            });
        });
    }

    function handleIncomeMessage(m) {
        var self = user;
        var senderUuid = m.pn_gcm.data.uuid;
        var messageText = m.pn_gcm.data.message;

        if (senderUuid === App.Settings.systemUuid) {
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

           
        }
        else {
            console.log("created new chat");
            self.addChat({senderId: senderUuid});
            self.chats[senderUuid].addChatSession(senderUuid, senderUuid);
            self.chats[senderUuid].getLastUnexpiredChatSession(); 
            var lastSession = self.chats[senderUuid].lastUnexpiredChatSession;
        }

        if (messageText === "$===real===") {
            self.chats[senderUuid].isVirtual = false;
            messageText = "<span class='text-bold'>пользователь зарегистрировался</span>";
            // messageText = $sce.trustAsHtml(messageText);
        }

        lastSession.messages.push({
            text: messageText,
            isOwn: false
        });

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
            // console.log("last seen message timestamp * 10000: ", 
            //     (user.lastMessageTimestamp * 10000).toString());
            pubnub.history(
                {
                    channel: user.channel,
                    end: (user.lastMessageTimestamp + differencePubnubDeviceTime) * 10000,
                    callback: function(res) {
                        // console.log("unseen messages: ", res);
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

    function getMessagesForVirtualChat() {
        // console.log("last seen message timestamp * 10000: ", 
        //     (user.lastMessageTimestamp * 10000).toString());
        var MSEC_IN_MONTH = 30 * 24 * 3600 * 1000;
        pubnub.history(
            {
                channel: user.channel,
                end: MSEC_IN_MONTH * 10000,
                callback: function(res) {
                    console.log("unseen messages: ", res);
                    var messages = res[0];
                    for (var i = 0; i < messages.length; i++) {
                        handleIncomeMessage(messages[i]);
                    }

                    if (messages.length) {
                        console.log("redirected to chat");
                        location.href = "#/chat?senderId=" + messages[messages.length - 1].sender_uuid;
                    }
                }
            }
        );
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
            console.error("device id is undefined");
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
            storage.clear();
            unsubscribe();
            clearCurrentUser();
            removeDeviceFromChannel();
            d.resolve();
            console.log('user is logged out', user);
        }, 0);
        return d.promise;
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

    this.addFriend = function(fields) {
        // fields is object that contains {
        //     uuid: required,
        //     name: required,
        //     avatarObj: optional
        //     created: optional,
        //     email: optional
        //     phoneNumber: optional
        // }
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
        friendsList.addFriend(data);
    },

    this.addChat = function(chatData) {
        chatData.currentUser = this;
        this.chats[chatData.senderId] = new Chat(chatData);
        this.chats[chatData.senderId].updateInfo();
    };
   
    this.parseFromStorage = function() {
        var self = this;
        self.isParsingFromStorageNow = true;
        $q.all([
            storage.getUser().then(function(dataFromStorage) {
                self.name = dataFromStorage.name;
                self.uuid = dataFromStorage.uuid;
                self.channel = dataFromStorage.channel;
                self.scores = dataFromStorage.scores;
                self.phoneNumber = dataFromStorage.phoneNumber;
                self.lastReadMessageTimestamp = dataFromStorage.lastReadMessageTimestamp;
                self.avatarUrl = dataFromStorage.avatarUrl;
                self.avatarUrlMini = dataFromStorage.avatarUrlMini;

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
                console.log("all user info was parsed from storage");
            },
            function() {
                console.warn("there was error while parsing");
            }
        );
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
            output.mini =  dataFromServer.avatar_url.replace(/(upload\/)([a-z0-9]*)(\/)/, '$1' + 'w_80' + '$3');
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

    var pubnub = PUBNUB.init({
        subscribe_key: App.Settings.pubnubSubscribeKey
    });



    if (this.isLogged()) {
        this.parseFromStorage();
        console.log("user data is taken from storage");
    }

    //for debugging
    window.user = this;

}]);