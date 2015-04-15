angular.module("angControllers").controller("mainController", [
    '$rootScope', '$scope', '$http', '$location', '$state', 'notification', 'api', 'storage', 'user', 'ChatSession', 
    function($rootScope, $scope, $http, $location, $state, notification, api, storage, user, ChatSession) {

    $scope.user = user;

    console.log('main controller is invoked');

    $rootScope.isAppInBackground = false;
    $scope.showChangeAvatarMenu = false;
    $scope.isAvaLoading = false;
    $scope.isMenuOpened = false;

    var statesWhereShowBackArrow = [
        'chat',
        'showImage',
        'chatInfo' 
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
          $(".iphone-status-bar-margin").show();
        }
    });

    $scope.openMenu = function() {
        // console.log("swipe open");
        $scope.isMenuOpened = true;
        if (window.device) {
            if (window.device.platform === "iOS") {
                cordova.plugins.Keyboard.close();
            }
        }
        $scope.countUnreadChats();
        $('.off-canvas-wrap').foundation('offcanvas', 'show', 'move-right');
    };

    $scope.closeMenu = function() {
        // console.log("swipe close");
        $scope.isMenuOpened = false;
        $('.off-canvas-wrap').foundation('offcanvas', 'hide', 'move-right');
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
        $scope.closeMenu();
        $scope.isChangeAvaMenuShown = false;
        user.avatarUrlMini = $scope.initialAvatarUrl;
    };

    $scope.countUnreadChats = function () {
        $scope.unreadChatsAmount = 0;
        for (var chat in user.chats) {
            if (!user.chats[chat].isRead) {
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

    $scope.$on('$stateChangeStart',
        function(evt, toState, toParams, fromState, fromParams) {
            if (statesWhereShowBackArrow.indexOf(toState.name) != -1) {
                $scope.showBackArrow();
            }
            else {
                $scope.hideBackArrow();
            }
            notification.clear();
        }
    );

}]);