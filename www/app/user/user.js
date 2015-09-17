services
.service('user', [
    '$timeout', 'storage', 'notification', 'api','$q', '$rootScope', 'stickersGallery', 'friendsList', '$sce', '$state', 'routing', 'Avatar', 'apiRequest',
    function($timeout, storage, notification, api, $q, $rootScope, stickersGallery, friendsList, $sce, $state, routing, Avatar, apiRequest) {
    
    this.isParsingFromStorageNow = false;
    this.parsedFromStorage = false;

    var user = this;
    clearCurrentUser();
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
        user.lastMessageTimestamp = null;
        user.isVirtual = null;
        friendsList.clear();
    }

    function getCurrentUserInfo(isVirtual) {
        if (!user.accessToken) {
            console.warn('access token is undefined');
            return;
        }

        return apiRequest.send(
            'POST',
            '/profile'
        )
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

    //public methods

    ////sign in up, logout functions
    this.signin = function(name, password, isVirtual) {
        return apiRequest.guestSend(
            'POST',
            '/login',
            {name: name, password: password}
        )
        .then(
            function(res) {
                setAccessToken(res.access_token);
                getCurrentUserInfo();
            },
            function(res) {
                return $q.reject(res.error); 
            }
        );
    };

    this.signinAsVirtualUser = function () {
        var data = {};
        if (document.referrer) {
            data.referrer = document.referrer;
        }
        if (location.search) {
            data.track = location.search.substr(1);
        }
        return apiRequest.guestSend(
            'POST',
            '/users/guest',
            data
        )
        .then(
            function(res) {
                setAccessToken(res.access_token);
                getCurrentUserInfo();
            }
        );
    };

    this.signup = function(name, password) {
        return apiRequest.guestSend(
            'POST',
            '/register',
            {name: name, password: password}
        )
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

    this.save = function() {
        storage.saveUser(user);
        log("user info is saved");
    };

    this.saveLastMessageTimestamp = function() {
        storage.saveLastMessageTimestamp(user.lastMessageTimestamp); 
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
                getCurrentUserInfo(res.access_token);    
            },
            function(res) {
                return $q.reject(res);
            }
        );
    };

    this.updateProfile = function(name, password) {
        var data = {};
        if (name) {
            data.name = name;
        }

        if (password) {
            data.password = password;
        }

        return (apiRequest.send(
            'PUT',
            '/profile',
            data
        ))
        .then(
            function(res) {
                getCurrentUserInfo();
                if (user.isVirtual) {
                    user.isVirtual = false;
                }
                log('updateProfile', res);
            },
            function(res) {
                return $q.reject(res);
            }
        );
    };

    this.parseFromStorage = function(dataFromStorage) {
        return $q.all([
            storage.getUser().then(function(dataFromStorage) {
                user.name = dataFromStorage.name;
                user.uuid = dataFromStorage.uuid;

                user.channel = dataFromStorage.channel;
                user.score = dataFromStorage.score;
                user.phoneNumber = dataFromStorage.phoneNumber;
                user.lastReadMessageTimestamp = dataFromStorage.lastReadMessageTimestamp;
                user.avatar = Avatar.parseFromStorage(dataFromStorage.avatar);
                user.isVirtual = dataFromStorage.isVirtual;

                setAccessToken(dataFromStorage.accessToken);
                // registerDeviceToChannel();
                stickersGallery.getCurrentUserCategories();
                log("user info is taken from storage", user);    
            }),
            storage.getLastMessageTimestamp().then(function(timestamp) {
                user.lastMessageTimestamp = timestamp;
            })
        ]);
    };

    this.socialSignin = function(provider, providerId, providerToken) {
        return api.socialSignin.apply(this, arguments)
        .then(function(res) {
            getCurrentUserInfo(res.access_token);
        });
    };

    //for debugging
    window.user = this;

}]);