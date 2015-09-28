angular.module("angControllers").controller("mainController", [
    '$rootScope', '$scope', 'notification', 'storage', 'user', 'chats','$timeout',
    'router','deviceInfo', '$state', '$q', 'friendsList',
function($rootScope, $scope, notification,  storage, user, chats, $timeout,
         router, deviceInfo, $state, $q, friendsList) {
    $scope.user = user;

    log('main controller is invoked');

    $rootScope.isAppInBackground = false;
    $scope.RAN_AS_APP = RAN_AS_APP;
    $scope.IS_MOBILE = IS_MOBILE;
    $scope.deviceInfo = deviceInfo;
    $scope.isUserScoreShown = true;
    $scope.version = version;
    $scope.debug = config('debugMode');

    function parseUserFromStorage() {
        user.isParsingFromStorageNow = true;
        user.parsedFromStoragePromise = $q.all([
            user.parseFromStorage(),
            chats.parseFromStorage(),
            friendsList.parseFromStorage()
        ])
        .then(
            function() {
                user.isParsingFromStorageNow = false;
                user.parsedFromStorage = true;
                $rootScope.$broadcast('user data parsed');
                log("all user info was parsed from storage");
            },
            function() {
                console.warn("there was error while parsing");
            }
        );

        return user.parsedFromStoragePromise;
    }

    var statesWhereShowBackArrow = [
        'chat',
        'showImage',
        'chatInfo',
        'invitation',
        'publishPreview',
        'pubItem'
    ];
    var forbidToGoBackStates = [
        'addVirtualChat',
        'createFastChat',
        'virtualChat'
    ];

    var statesAllowedForVirtualUser = [
        'updateProfile',
        'chat', 
        'invitation',
        'homepage',
        'exit'
    ];

    var statesNotShowScore = [
        'chat',
        'chatInfo',
        'showImage',
        'publishPreview'
    ];

    var statesFromRedirectLoggedUser = [
        'homepage',
        'start',
        'signin',
        'signup',
        'phoneRegistration'
    ];

    $scope.isWeb = !navigator.device;

    document.addEventListener("pause", function() {
        $rootScope.isAppInBackground = true;
        chats.save();
    });

    document.addEventListener("resume", function() {
        $rootScope.isAppInBackground = false;
    });

    document.addEventListener("deviceready", function() {
        if (device.platform === "iOS") {
          $(".iphone-hack").show();
        }
    });

    function hideSplashScreen() {
        if (RAN_AS_APP) {
            setTimeout(function() {
                navigator.splashscreen.hide();
            }, 1000);
        }
    }

    $scope.openExternalURL = router.openExternalURL;

    $scope.toggleMenu = function() {
        //async call is necessary for correct work on android 4.1.1
        $timeout(function() {
            var state = snapper.state().state;
            // log(state);
            if (state === 'right') {
                // log('openning menu!');
                if (RAN_AS_APP) {
                    if (window.device.platform === "iOS") {
                        cordova.plugins.Keyboard.close();
                    }
                }
                log("device's OS is not iOS");
                
                snapper.open('left');
            }
            else {
                snapper.close('left');
            }
        }, 0);
    };

    $scope.showBackArrow = function() {
        $scope.isBackArrownShown = true;
    };

    $scope.hideBackArrow = function () {
        $scope.isBackArrownShown = false;
    };

    $scope.backArrowHandler = function() {
        router.closeCurrent();
    };

    $scope.publish = function() {
        router.goto('publishPreview', $state.params);
    };

    function onStateChangeStart(evt, toState, toParams, fromState, fromParams) {
        notification.clear();

        if (RAN_AS_APP) {
            router.is_preload = true;
        }   
         
        $scope.isUserScoreShown = !_.includes(statesNotShowScore, toState.name);
        
        // if (user.isVirtual) {
        //     if (!_.includes(statesAllowedForVirtualUser, toState.name)) {
        //         evt.preventDefault();
        //         var senderId = Object.keys(user.chats)[0];
        //         if (senderId) {
        //             $state.go('chat', 
        //                 {
        //                     senderId: senderId
        //                 }
        //             );
        //         }
        //         else {
        //             $state.go('updateProfile');
        //         }
        //     }
        //     router.is_preload = false;
        //     return;
        // }

        if (user.isLogged()) {
            if (_.includes(statesFromRedirectLoggedUser, toState.name)) {
                evt.preventDefault();
                $state.go('pubsList');
/*                if (_.isEmpty(user.chats)) {
                    $state.go('friends');
                }
                else {
                    $state.go('chats');
                }  */
            }
        }
        else if (toState.name === 'start') {
            evt.preventDefault();
            $state.go('pubsList');
        }

        if (_.includes(statesWhereShowBackArrow, toState.name) && 
            !_.includes(forbidToGoBackStates, fromState.name)) {
            $scope.showBackArrow();
        }
        else {
            $scope.hideBackArrow();
        }    
    }

    $scope.$on('$stateChangeStart',
        function(evt, toState, toParams, fromState, fromParams) {
            if (user.isLogged()) {
                if (user.parsedFromStorage) {
                    onStateChangeStart.apply(this, arguments);
                }
                else {
                    router.is_preload = true;
                    evt.preventDefault();
                    user.parsedFromStoragePromise.then(
                        function() {
                            $state.go(toState.name, toParams);
                        }
                    );
                }
            }
            else {
                onStateChangeStart.apply(this, arguments);
            }
        }
    );

    if (user.isLogged()) {
        parseUserFromStorage()
        .then(function() {
            if (RAN_AS_APP) {
                if (_.isEmpty(user.chats)) {
                    $state.go('pubsList')
                    .then(
                        hideSplashScreen
                    );
                }
                else {
                    $state.go('random')
                    .then(
                        hideSplashScreen
                    );
                }
            }
            else {
                if (_.includes(statesFromRedirectLoggedUser, $state.current.name)) {
                    if (_.isEmpty(user.chats)) {
                        $state.go('pubsList');
                    }
                    else {
                        $state.go('random');
                    }    
                }
            }
        });
    }
    else {
        $state.go('pubsList');
    }

    $scope.router = router;
    $scope.goto = router.goto;

}]);