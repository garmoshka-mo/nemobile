angular.module("angControllers").controller("mainController", [
    '$rootScope', '$scope', 'notification', 'storage', 'user', 'chats','$timeout',
    'router','deviceInfo', '$state', '$q', 'friendsList', 'menu', 'language',
    'socket',
function($rootScope, $scope, notification,  storage, user, chats, $timeout,
         router, deviceInfo, $state, $q, friendsList, menu, language,
         socket) {
    $scope.user = user;

    log('main controller is invoked');

    
    function hideAddressBar(){
        if(document.documentElement.scrollHeight<window.outerHeight/window.devicePixelRatio)
            document.documentElement.style.height=(window.outerHeight/window.devicePixelRatio)+'px';
        setTimeout(window.scrollTo(1,1),0);
    }
    window.addEventListener("orientationchange",function(){hideAddressBar();});
    setTimeout(hideAddressBar,1000);
    setTimeout(socket.connect, (!IS_APP && IS_ANDROID) ? 5000 : 0);
    
    $rootScope.isAppInBackground = false;
    $scope.IS_APP = IS_APP;
    $scope.IS_MOBILE = IS_MOBILE;
    $scope.IS_ANDROID = IS_ANDROID;
    $scope.ALT_UI = ALT_UI;
    $scope.deviceInfo = deviceInfo;
    $scope.isUserScoreShown = true;
    $scope.version = version;
    $scope.language = language;
    $scope.debug = config('debugMode');

    var statesWhereShowBackArrow = [
        'loadAvatar',
        'about',
        'mobileApp'
        //'sendSecret'
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
        setTimeout(function() {
            $('.splash-screen').hide();
            if (IS_APP) 
                navigator.splashscreen.hide();
        }, 500);
    }

    $scope.openExternalURL = router.openExternalURL;

    $scope.toggleMenu = function() {
        //async call is necessary for correct work on android 4.1.1
        $timeout(function() {
            if (IS_APP) {
                if (window.device.platform === "iOS") {
                    cordova.plugins.Keyboard.close();
                }
            }
            menu.toggle();
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
            if (IS_APP)
                router.is_preload = true;
            $scope.isUserScoreShown = !_.includes(statesNotShowScore, toState.name);
            $scope.isBackArrowShown = _.includes(statesWhereShowBackArrow, toState.name);

        }
    );

    var promises = [
        user.loadFromStorage(),
        chats.loadFromStorage(),
        friendsList.loadFromStorage()
    ];

    if (!user.isLogged()) {
        promises.push(language.detectLanguage());
    }

    $q.all(promises)
    .then(
        function(res) {
            //res[3] should contain
            //detectLanguage result
            if (res[3]) {
                language.change(res[3]);
            }
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