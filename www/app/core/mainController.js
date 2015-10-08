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
    $scope.IS_ANDROID = IS_ANDROID;
    $scope.deviceInfo = deviceInfo;
    $scope.isUserScoreShown = true;
    $scope.version = version;
    $scope.debug = config('debugMode');

    var statesWhereShowBackArrow = [
        'loadAvatar',
        'about',
        'mobileApp'
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
            }, 300);
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

    $scope.backArrowHandler = function() {
        router.goBack();
    };

    $scope.publish = function() {
        router.goto('publishPreview', $state.params);
    };

    $scope.isMainBranded = function() {
        return router.main.branded || $state.current.branded;
    };

    $scope.$on('$stateChangeStart',
        function(evt, toState, toParams, fromState, fromParams) {
            if (RAN_AS_APP)
                router.is_preload = true;
            $scope.isUserScoreShown = !_.includes(statesNotShowScore, toState.name);
            $scope.isBackArrowShown = _.includes(statesWhereShowBackArrow, toState.name);

        }
    );

    $q.all([
        user.loadFromStorage(),
        chats.loadFromStorage(),
        friendsList.loadFromStorage()
    ])
    .then(
        function() {
            log("all user info was parsed from storage");
        },
        function() {
            console.warn("there was error while parsing");
        }
    )
    .then(hideSplashScreen);

    $scope.router = router;
    $scope.goto = router.goto;

}]);