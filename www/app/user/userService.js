var user_uuid; // todo: remove after refactoring of user
services
.service('user', [
    '$timeout', 'storage', 'externalChat', 'notification', 'api','$q', '$rootScope', '$http', 'stickersGallery', 'friendsList', '$sce', '$state', 'routing', 'chats', 'Avatar', 
    function($timeout, storage, externalChat, notification, api, $q, $rootScope, $http, stickersGallery, friendsList, $sce, $state, routing, chats, Avatar) {
    
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
        user.avatar = new Avatar(userInfo);

        isLogged = true;
        user.parsedFromStorage = true;
        localStorage.setItem('isLogged', true);
        stickersGallery.getCurrentUserCategories();
        user.save();
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

    // function getPubnubTimeDifference() {
    //     var d = $q.defer();
    //     pubnub.time(function(time) {
    //         differencePubnubDeviceTime = time / 10000 - new Date().getTime();
    //         log("difference between pubnub and device time: ", differencePubnubDeviceTime);
    //         d.resolve(differencePubnubDeviceTime);
    //     });
    //     return d.promise;
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
            $rootScope.$broadcast('user logged out', {user: _user});
            d.resolve();
            log('user logged out', user);
        }, 0);
        return d.promise;
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
                self.avatar = Avatar.parseFromStorage(dataFromStorage.avatar);
                self.isVirtual = dataFromStorage.isVirtual;

                setAccessToken(dataFromStorage.accessToken);
                // registerDeviceToChannel();
                stickersGallery.getCurrentUserCategories();
                log("user info is taken from storage", self);
            }),
            chats.parseFromStorage(),
            storage.getLastMessageTimestamp().then(function(timestamp) {
                self.lastMessageTimestamp = timestamp;
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