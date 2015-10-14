angular.module("angServices")
.service('user', [
    '$timeout', 'storage', 'notification', 'api','$q', '$rootScope', 'stickersGallery', 'tracker',
        'friendsList', '$sce', '$state', 'Avatar', 'userRequest', 'guestRequest', 'ScoreKeeper',
function($timeout, storage, notification, api, $q, $rootScope, stickersGallery, tracker,
         friendsList, $sce, $state, Avatar, userRequest, guestRequest, ScoreKeeper) {


    var self = this;
    clearCurrentUser();

    var isLogged = null;
    var passiveDeferred = $q.defer();

    self.passivePromise = passiveDeferred.promise;
    self.user_score = null; // todo: remove after a while
    self.honor = new ScoreKeeper('user scores');

    this.refreshProfile = function(profile) {
        self.honor.update({ score: profile.honor});
    };

    function populateProfile(userInfo) {
        self.name = userInfo.name;
        self.channel = userInfo.channel_group_name;
        self.uuid = userInfo.uuid;

        self.score = userInfo.score;
        self.phoneNumber = userInfo.phone_number;

        if(self.avatar) {
            self.avatar.update(userInfo);
        } else {
            self.avatar = new Avatar(userInfo);
        }

        isLogged = true;
        stickersGallery.getCurrentUserCategories();
        self.save();
        $rootScope.$broadcast('user logged in');
        passiveDeferred.resolve();

        localStorage.setItem('isLogged', true);
        if (ALT_UI) localStorage.setItem('altUI', true);
    }

    function setAccessToken(accessToken) {
        self.accessToken = accessToken;
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

        return userRequest.send(
            'POST',
            '/profile'
        )
        .then(
            function(res) {
                // log('userInfo', userInfo);
                self.isVirtual = isVirtual ? true : false;
                populateProfile(res.user);
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
        return guestRequest.send(
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
        return guestRequest.send(
            'POST',
            '/users/guest',
            tracker.getTrackData()
        )
        .then(
            function(res) {
                setAccessToken(res.access_token);
                getCurrentUserInfo();
            }
        );
    };

    this.signup = function(name, password) {
        return guestRequest.send(
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
            $rootScope.$broadcast('user logged out', {user: _user});
            d.resolve();
            log('user logged out', self);
        }, 0);
        return d.promise;
    };

    this.logoutAndGoHome = function() {
        self.logout()
            .then(function() {
                location.reload();
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

        return (userRequest.send(
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

    // todo: remove after a while - this is temporary - to save values from browser of users who collected
    function saveHonor(honor) {
        if (honor)
            userRequest.send('PUT', '/profile/save_honor', {honor: honor})
            .then(
                function(res) {
                    self.honor.update({ score: honor });
                    self.user_score = null;
                    self.save();
                }
            );
    }

    var loadingFromStoragePromise = null;
    this.loadFromStorage = function() {
        if (loadingFromStoragePromise) return loadingFromStoragePromise;

        if (!self.isLogged())
            loadingFromStoragePromise = $q.when(true);
        else
            loadingFromStoragePromise = $q.all(
        [
            storage.getUser()
            .then(function(dataFromStorage) {
                setAccessToken(dataFromStorage.accessToken);

                self.name = dataFromStorage.name;
                self.uuid = dataFromStorage.uuid;

                self.channel = dataFromStorage.channel;
                self.score = dataFromStorage.score;
                self.phoneNumber = dataFromStorage.phoneNumber;
                self.lastReadMessageTimestamp = dataFromStorage.lastReadMessageTimestamp;
                self.avatar = Avatar.loadFromStorage(dataFromStorage.avatar);
                self.isVirtual = dataFromStorage.isVirtual;

                self.user_score = dataFromStorage.user_score;
                saveHonor(self.user_score);

                // registerDeviceToChannel();
                stickersGallery.getCurrentUserCategories();
                log("user info is taken from storage", self);
                $rootScope.$broadcast('user data loaded');
                passiveDeferred.resolve();
            }),

            storage.getLastMessageTimestamp().then(function(timestamp) {
                self.lastMessageTimestamp = timestamp;
            })
        ]);

        return loadingFromStoragePromise;
    };

    this.socialSignin = function(provider, providerId, providerToken) {
        return api.socialSignin.apply(this, arguments)
        .then(function(res) {
            getCurrentUserInfo(res.access_token);
        });
    };

    // todo: remove global user after refactoring
    window.user = this;

}]);