angular.module("angControllers").controller("mainController", [
    '$rootScope', '$scope', '$http', '$location', '$state', 'notification', 'api', 'storage', 'user', 'ChatSession','$timeout', 
    function($rootScope, $scope, $http, $location, $state, notification, api, storage, user, ChatSession, $timeout) {

    $scope.user = user;

    console.log('main controller is invoked');

    $rootScope.isAppInBackground = false;
    $scope.showChangeAvatarMenu = false;
    $scope.isAvaLoading = false;
    $scope.isMenuOpened = false;
    $scope.isUserScoresShown = true;

    var statesWhereShowBackArrow = [
        'chat',
        'showImage',
        'chatInfo',
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

    $scope.toggleMenu = function() {
        //async call is necessary for correct work on android 4.1.1
        $timeout(function() {
            var state = snapper.state().state;
            console.log(state);
            if (state === 'right') {
                console.log('openning menu!');
                if (window.device) {
                    if (window.device.platform === "iOS") {
                        cordova.plugins.Keyboard.close();
                    }
                }
                console.log("device's OS is not iOS");
                $scope.countUnreadChats();
                snapper.open('left');
            }
            else {
                snapper.close('left');
            }
        }, 0);
    };

    $scope.generateNewAvatar = function() {
        var newGuid = Math.round(Math.random() * 10000);
        user.avatarUrlMini = App.Settings.adorableUrl + "/40/" + newGuid;
        $scope.isChangeAvaMenuShown = true;
        $scope.isAvaLoading = true;

        $scope.applyCurrentAvatar = function() {
            $scope.isChangeAvaMenuShown = false;
            user.updateAvatarGuid(newGuid);
            user.save();
        };
    };

    $scope.showChangeAvatarMenu = function() {
        $scope.initialAvatarUrl = user.avatarUrlMini; 
        $scope.isChangeAvaMenuShown = true;
        $scope.generateNewAvatar();
    };

    $scope.restoreDefaultAvatar = function() {
        user.avatarUrlMini = $scope.initialAvatarUrl;
        $scope.isChangeAvaMenuShown = false;
        $scope.isAvaLoading = true;
    };

    $scope.imageLoadedHandler = function() {
        $scope.isAvaLoading = false;
    };

    $scope.goToLoadAvatar = function() {
        location.href = "#/loadAvatar";
        $scope.toggleMenu();
        $scope.isChangeAvaMenuShown = false;
        user.avatarUrlMini = $scope.initialAvatarUrl;
    };

    $scope.countUnreadChats = function () {
        $scope.unreadChatsAmount = 0;
        for (var chat in user.chats) {
            if (!user.chats[chat].isRead && !user.chats[chat].isExpired) {
                $scope.unreadChatsAmount++;
            }
        }
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

    $scope.goToAboutProgram = function() {
        $state.go('about');
    };

    $scope.$on('$stateChangeStart',
        function(evt, toState, toParams, fromState, fromParams) {
            // console.log("state is changed!");
            notification.clear();

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

            if (_.includes(statesWhereShowBackArrow, toState.name) && 
                !_.includes(forbidToGoBackStates, fromState.name)) {
                $scope.showBackArrow();
            }
            else {
                $scope.hideBackArrow();
            }
        }
    );

    

}]);