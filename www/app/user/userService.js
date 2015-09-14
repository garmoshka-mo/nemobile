var user_uuid; // todo: remove after refactoring of user
services
.service('user', [
    '$timeout', 'storage', 'externalChat', 'notification', 'api','$q', '$rootScope', '$http', 'stickersGallery', 'friendsList', '$sce', '$state', 'routing', 'chats', 
    function($timeout, storage, externalChat, notification, api, $q, $rootScope, $http, stickersGallery, friendsList, $sce, $state, routing, chats) {
    
    this.name = null;
    this.uuid = null;
    this.accessToken = null;
    this.channel = null;
    this.score = null;
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

    function handleSuccessSignIn(userInfo) {
        user.name = userInfo.name;
        user.channel = userInfo.channel_group_name;
        user.uuid = userInfo.uuid;
        user_uuid = user.uuid; // todo: remove after refactoring of user

        user.score = userInfo.score;
        user.phoneNumber = userInfo.phone_number;
        
        var avatarParseResult = user.parseAvatarDataFromServer(userInfo);
        log(avatarParseResult);
        user.avatarUrl = avatarParseResult.fullSize;
        user.avatarUrlMini = avatarParseResult.mini;

        isLogged = true;
        user.parsedFromStorage = true;
        localStorage.setItem('isLogged', true);
        getUserFriendsFromServer()
        .then(
            function() {
                // user.friendsList.updateNepotomFriendsInfo()
                // .then(function() {
                //     log("friends list is downloaded from server");
                //     $state.go($state.current, {}, {reload: true});
                // });
            }
        );
        user.save();
        stickersGallery.getCurrentUserCategories();
        // registerDeviceToChannel();
        $rootScope.$broadcast('user logged in');
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
        user.score = null;
        user.friends = {};
        user.chats = {};
        user.lastMessageTimestamp = null;
        user.isVirtual = null;
        friendsList.clear();
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

    


    

    // function getPubnubTimeDifference() {
    //     var d = $q.defer();
    //     pubnub.time(function(time) {
    //         differencePubnubDeviceTime = time / 10000 - new Date().getTime();
    //         log("difference between pubnub and device time: ", differencePubnubDeviceTime);
    //         d.resolve(differencePubnubDeviceTime);
    //     });
    //     return d.promise;
    // }

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
                    log("unseen messages: ", res);
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

        log('while you were away', messages);
        
        window.isGotUnseenMessage = true;
    }

    function getUnseenMessages() {
        var d = $q.defer();
        
        if (user.lastMessageTimestamp || user.isVirtual) {
            // log("last seen message timestamp * 10000: ",
            //     (user.lastMessageTimestamp * 10000).toString());
            
            getGroupChannels()
            .then(
                function(channels) {
                    var channelsHistoriesPromises = [];

                    // log('channels were got', channels);
                    
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
    //     // log("last seen message timestamp * 10000: ",
    //     //     (user.lastMessageTimestamp * 10000).toString());
    //     var MSEC_IN_MONTH = 30 * 24 * 3600 * 1000;


    //     pubnub.history(
    //         {
    //             channel: user.channel,
    //             end: MSEC_IN_MONTH * 10000,
    //             callback: function(res) {
    //                 log("unseen messages: ", res);
    //                 var messages = res[0];
    //                 for (var i = 0; i < messages.length; i++) {
    //                     handleIncomeMessage(messages[i]);
    //                 }

    //                 if (messages.length) {
    //                     log("redirected to chat");
    //                     location.href = "#/chat?senderId=" + messages[messages.length - 1].sender_uuid;
    //                 }
    //             }
    //         }
    //     );
    // }
    function updateUserInfo(accessToken) {
        var at = accessToken ? accessToken : user.accessToken;
        user.signin(null, null, at);
        log('user info is updated');
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

    //public methods

     this.registerDeviceToChannel = function(channel) {
        if (window.deviceId) {
            var type = device.platform === "iOS" ? "apns" : "gcm";
           
            pubnub.mobile_gw_provision ({
                device_id: window.deviceId,
                op: 'add',
                gw_type: type,
                channel: channel,
                callback: function(res) {
                    log("device was registered channel", res);
                },
                error: function(res) {
                    log("register device error", res);
                }
            });
            
        }
        else {
            if (RAN_AS_APP) console.warn("device id is undefined");
        }     
    };

    this.removeDeviceFromChannel = function(channel) {
        if (window.deviceId) {
            // if channel is defined remove only from
            // this channel else remove from all channels
            if (channel) {
                pubnub.mobile_gw_provision ({
                    device_id: window.deviceId,
                    op: 'remove',
                    gw_type: type,
                    channel: channel,
                    callback: function(res) {
                        log("device was unregistered from", res);
                    },
                    error: function(res) {
                        log("unregister device error", res);
                    }
                });
            }
            else {
                var type = device.platform === "iOS" ? "apns" : "gcm";
                var url = "http://pubsub.pubnub.com/v1/push/sub-key/"
                    + config('pubnubSubscribeKey')  + "/devices/"
                    + window.deviceId + "/remove?type=" + type;
                $http.get(url).then(
                    function(res) {
                        log(res);
                    },
                    function(res) {
                        log(res);
                    }
                );
            }
        }
    };

    this.signin = function(name, password, accessToken, isVirtual) {
        var self = this;

        function getUserInfo(accessToken) {
            return api.getUserInfo(accessToken)
            .then(
                function(res) {
                    // log('userInfo', userInfo);
                    user.isVirtual = isVirtual ? true : false;
                    handleSuccessSignIn(res.user);
                    log("user is logged", user);
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
                    setAccessToken(res.access_token);
                },
                function showError(res) {
                    return $q.reject(res.error); 
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
                return $q.reject(res.error);
            }
        );
    };

    this.logout = function() {
        var _user = this;
        var d = $q.defer();
        $timeout(function() {
            isLogged = false;
            storage.clear();
            // unsubscribe();
            clearCurrentUser();
            clearApiAccessToken();
            user.removeDeviceFromChannel();
            $rootScope.$broadcast('user logged out', {user: _user});
            d.resolve();
            log('user is logged out', user);
        }, 0);
        return d.promise;
    };

    this.getUnseenMessages = function() {
        if (differencePubnubDeviceTime) {
            return getUnseenMessages();
        }
        else {
            var d = $q.defer();

            // getPubnubTimeDifference()
            // .then(function() {
            //     getUnseenMessages()
            //     .then(
            //         function() {
            //             d.resolve();
            //         }
            //     );
            // });

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

    this.parseFromStorage = function() {
        var self = this;
        self.isParsingFromStorageNow = true;
        this.parsedFromStoragePromise = $q.all([
            storage.getUser().then(function(dataFromStorage) {
                self.name = dataFromStorage.name;
                self.uuid = dataFromStorage.uuid;
                user_uuid = user.uuid; // todo: remove after refactoring of user

                self.channel = dataFromStorage.channel;
                self.score = dataFromStorage.score;
                self.phoneNumber = dataFromStorage.phoneNumber;
                self.lastReadMessageTimestamp = dataFromStorage.lastReadMessageTimestamp;
                self.avatarUrl = dataFromStorage.avatarUrl;
                self.avatarUrlMini = dataFromStorage.avatarUrlMini;
                self.isVirtual = dataFromStorage.isVirtual;

                setAccessToken(dataFromStorage.accessToken);
                // registerDeviceToChannel();
                stickersGallery.getCurrentUserCategories();
                log("user info is taken from storage", self);
            }),
            chats.parseFromStorage(),
            storage.getLastMessageTimestamp().then(function(timestamp) {
                self.lastMessageTimestamp = timestamp;
                self.getUnseenMessages();
            }),

            storage.getFriendsList().then(function(dataFromStorage){
                friendsList.parseFromStorage(dataFromStorage);
                self.friendsList = friendsList;
                log("user's friends list is taken from storage");
            })
        ])
        .then(
            function() {
                self.isParsingFromStorageNow = false;
                self.parsedFromStorage = true;
                $rootScope.$broadcast('user data parsed');
                log("all user info was parsed from storage");
            },
            function() {
                console.warn("there was error while parsing");
            }
        );

        return this.parsedFromStoragePromise;
    };

    this.save = function() {
        storage.saveUser(this);
        log("user info is saved");
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

    // this.subscribe = function() {
    //     var self = this;
    //     pubnub.subscribe({
    //         channel_group: self.channel,
    //         message: function(message, envelope, channelName) {
    //             // log(message, envelope);
    //             handleIncomeMessage(message, envelope);
    //         }
    //     });
        
    // };

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
                log("updating avatar is failed");
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
                log("updating avatar is failed");
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
                log('updateProfile', res);
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
            output.fullSize = config('adorableUrl') + '/' + dataFromServer.avatar_guid;
            output.mini = config('adorableUrl') + '/40/' + dataFromServer.avatar_guid;
        }
        else if (dataFromServer.uuid) {
            output.fullSize = config('adorableUrl') + '/' + dataFromServer.uuid;
            output.mini = config('adorableUrl') + '/40/' + dataFromServer.uuid;
        }
        else {
            output.fullSize = config('adorableUrl') + '/' + Math.round(Math.random() * 1000);
            output.mini = config('adorableUrl') + '/40/' + Math.round(Math.random() * 1000);
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

   

    //for debugging
    window.user = this;

}]);