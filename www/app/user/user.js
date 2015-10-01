angular.module("angServices")
.service('user', [
    '$timeout', 'storage', 'notification', 'api','$q', '$rootScope', 'stickersGallery',
        'friendsList', '$sce', '$state', 'router', 'Avatar', 'apiRequest',
    function($timeout, storage, notification, api, $q, $rootScope, stickersGallery,
             friendsList, $sce, $state, router, Avatar, apiRequest) {
    
    this.isParsingFromStorageNow = false;
    this.parsedFromStorage = false;

    var self = this;
    clearCurrentUser();
    var isLogged = null;

    function handleSuccessSignIn(userInfo) {
        self.name = userInfo.name;
        self.channel = userInfo.channel_group_name;
        self.uuid = userInfo.uuid;

        self.score = userInfo.score;
        self.phoneNumber = userInfo.phone_number;
        self.avatar = new Avatar(userInfo);

        isLogged = true;
        self.parsedFromStorage = true;
        localStorage.setItem('isLogged', true);
        stickersGallery.getCurrentUserCategories();
        self.save();
        $rootScope.$broadcast('user logged in');
    }

    function setAccessToken(accessToken) {
        self.accessToken = accessToken;
        api.setAccessToken(accessToken);
    }

    function clearApiAccessToken() {
        api.clearAccessToken();
    }

    function clearCurrentUser() {
        self.name = null;
        self.uuid = null;
        self.accessToken = null;
        self.channel = null;
        self.score = null;
        self.lastMessageTimestamp = null;
        self.isVirtual = null;
        friendsList.clear();
    }

    function getCurrentUserInfo(isVirtual) {
        if (!self.accessToken) {
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
                self.isVirtual = isVirtual ? true : false;
                handleSuccessSignIn(res.user);
                log("user is logged", self);
            },
            function(res) {
                console.error("sign in fail");
                return $q.reject(res);
            }
        );
    }

    //necessary in order to update update data about avatar
    $rootScope.$on('user avatar was updated', getCurrentUserInfo);

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


    this.ensure = function() {
        if (this.isLogged())
            return $q.when(true);
        else
            return user.signinAsVirtualUser();
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
            log('user logged out', self);
        }, 0);
        return d.promise;
    };

    this.logoutAndGoHome = function() {
        self.logout()
            .then(function() {
                router.goto('pubsList');
            });
    };

    this.save = function() {
        storage.saveUser(self);
        log("user info is saved");
    };

    this.saveLastMessageTimestamp = function() {
        storage.saveLastMessageTimestamp(self.lastMessageTimestamp);
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
                if (self.isVirtual) {
                    self.isVirtual = false;
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
                self.name = dataFromStorage.name;
                self.uuid = dataFromStorage.uuid;

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
            storage.getLastMessageTimestamp().then(function(timestamp) {
                self.lastMessageTimestamp = timestamp;
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