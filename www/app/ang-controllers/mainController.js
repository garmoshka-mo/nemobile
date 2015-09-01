angular.module("angControllers").controller("mainController", [
    '$rootScope', '$scope', '$http', 'notification', 'api', 'storage', 'user', 'ChatSession','$timeout', 'routing','deviceInfo', '$state',
function($rootScope, $scope, $http, notification, api, storage, user, ChatSession, $timeout, routing, deviceInfo, $state) {

    $scope.user = user;

    log('main controller is invoked');

    $rootScope.isAppInBackground = false;
    $scope.RAN_AS_APP = RAN_AS_APP;
    $scope.isOnline = deviceInfo.isOnline; 
    $scope.isUserScoresShown = true;

    var statesWhereShowBackArrow = [
        'chat',
        'showImage',
        'chatInfo',
        'invitation'
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

    $scope.isWeb = !navigator.device;

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

    $scope.openExternalURL = function(url) {
        window.open(url,'_blank');
    };

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
        window.history.back();
        scrollToTop();
    };

    function onStateChangeStart(evt, toState, toParams, fromState, fromParams) {
        notification.clear();

        if (RAN_AS_APP) {
            routing.is_preload = true;
        }   
         
        $scope.isUserScoresShown = !_.includes(statesNotShowScores, toState.name);
        
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
        //     routing.is_preload = false;
        //     return;
        // }

        if (user.isLogged()) {
            if (_.includes(statesFromRedirectLoggedUser, toState.name)) {
                evt.preventDefault();
                $state.go('random');
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
            //$state.go('homepage');
            $state.go('random');
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
                onStateChangeStart.apply(this, arguments);
            }
        }
    );

    $scope.$on('stateChangeSuccess', scrollToTop);
    var $scrollContainer = $(".main-section");
    function scrollToTop() {
        $scrollContainer.scrollTop(0);
    }

    if (user.isLogged()) {
        user.parseFromStorage()
        .then(function() {
            if (RAN_AS_APP) {
                if (_.isEmpty(user.chats)) {
                    $state.go('random')
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
                        $state.go('random');
                    }
                    else {
                        $state.go('random');
                    }    
                }
            }
        });
    }
    else {
        $state.go('random');
    }

    $scope.routing = routing;
    $scope.goto = routing.goto;

}]);