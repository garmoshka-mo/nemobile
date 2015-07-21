angular.module("angControllers").controller("mainController", [
    '$rootScope', '$scope', '$http', 'notification', 'api', 'storage', 'user', 'ChatSession','$timeout', 'routing','deviceInfo', '$state',
    function($rootScope, $scope, $http, notification, api, storage, user, ChatSession, $timeout, routing, deviceInfo, $state) {

    $scope.user = user;

    console.log('main controller is invoked');

    $rootScope.isAppInBackground = false;
    $scope.RAN_AS_APP = RAN_AS_APP;
    $scope.isOnline = deviceInfo.isOnline; 
    $scope.isUserScoresShown = true;

    var statesWhereShowBackArrow = [
        'chat',
        'showImage',
        'chatInfo'
    ];
    var forbidToGoBackStates = [
        'addVirtualChat'
    ];

    var statesAllowedForVirtualUser = [
        'updateProfile',
        'chat'
    ];

    var statesNotShowScores = [
        'chat',
        'chatInfo',
        'showImage'
    ];

    var statesFromRedirectLoggedUser = [
        'homepage',
        'start',
        'signin',
        'signup',
        'phoneRegistration'
    ];

    if (navigator.device) {
        $scope.isWeb = false;
    }
    else {
        $scope.isWeb = true;
    }

    document.addEventListener("pause", function() {
        $rootScope.isAppInBackground = true;
        user.saveChats();
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

    $scope.toggleMenu = function() {
        //async call is necessary for correct work on android 4.1.1
        $timeout(function() {
            var state = snapper.state().state;
            console.log(state);
            if (state === 'right') {
                console.log('openning menu!');
                if (RAN_AS_APP) {
                    if (window.device.platform === "iOS") {
                        cordova.plugins.Keyboard.close();
                    }
                }
                console.log("device's OS is not iOS");
                
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
        window.history.back();
    };

    function onStateChangeStart(evt, toState, toParams, fromState, fromParams) {
        notification.clear();

        if (RAN_AS_APP) {
            routing.is_preload = true;
        }   
         
        if (_.includes(statesNotShowScores, toState.name)) {
            $scope.isUserScoresShown = false;
        }
        else {
            $scope.isUserScoresShown = true;
        }
        
        if (user.isVirtual) {
            if (!_.includes(statesAllowedForVirtualUser, toState.name)) {
                evt.preventDefault();
            }
            return;
        }

        if (user.isLogged()) {
            if (_.includes(statesFromRedirectLoggedUser, toState.name)) {
                evt.preventDefault();
                if (_.isEmpty(user.chats)) {
                    $state.go('friends');
                }
                else {
                    $state.go('chats');
                }    
            }
        }
        else if (toState.name === 'start') {
            evt.preventDefault();
            $state.go('homepage');
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
            // console.log("state is changed!");
            var changeParamas = arguments;
            if (user.isLogged()) {
                if (user.parsedFromStorage) {
                    onStateChangeStart.apply(this, changeParamas);
                }
                else {
                    routing.is_preload = true;
                    evt.preventDefault();
                    user.parsedFromStoragePromise.then(
                        function() {
                            $state.go(toState.name, toParams);
                        }
                    );
                }
            }
            else {
                onStateChangeStart.apply(this, changeParamas);
            }
        }
    );

    if (user.isLogged()) {
        user.parseFromStorage()
        .then(function() {
            if (RAN_AS_APP) {
                if (_.isEmpty(user.chats)) {
                    $state.go('friends')
                    .then(
                        hideSplashScreen
                    );
                }
                else {
                    $state.go('chats')
                    .then(
                        hideSplashScreen
                    );
                }
            }
            else {
                if (_.includes(statesFromRedirectLoggedUser, $state.current.name)) {
                    if (_.isEmpty(user.chats)) {
                        $state.go('friends');
                    }
                    else {
                        $state.go('chats');
                    }    
                }
            }
        });
    }
    else {
        $state.go('homepage');
    }

    $scope.routing = routing;
    $scope.goto = routing.goto;

}]);