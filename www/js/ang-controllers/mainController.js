angular.module("angControllers").controller("mainController", [
    '$rootScope', '$scope', '$http', '$location', '$state', 'notification', 'api', 'storage', 'user', 'ChatSession', 
    function($rootScope, $scope, $http, $location, $state, notification, api, storage, user, ChatSession) {

    $scope.user = user;

    console.log('main controller is invoked');

    $rootScope.isAppInBackground = false;
    $scope.showChangeAvatarMenu = false;
    $scope.isAvaLoading = false;

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
        if (window.device) {
            if (window.device.platform === "iOS") {
                cordova.plugins.Keyboard.close();
            }
        }
        $('.off-canvas-wrap').foundation('offcanvas', 'show', 'move-right');
    };

    $scope.closeMenu = function() {
        // console.log("swipe close");
        $('.off-canvas-wrap').foundation('offcanvas', 'hide', 'move-right');
    };

    $scope.generateNewAvatar = function() {
        var newGuid = Math.round(Math.random() * 10000);
        user.avatarUrl = App.Settings.adorableUrl + "/40/" + newGuid;
        $scope.isChangeAvaMenuShown = true;
        $scope.isAvaLoading = true;

        $scope.applyCurrentAvatar = function() {
            $scope.isChangeAvaMenuShown = false;
            user.updateAvatarGuid(newGuid);
            user.save();
        };
    };

    $scope.showChangeAvatarMenu = function() {
        $scope.initialAvatarUrl = user.avatarUrl; 
        $scope.isChangeAvaMenuShown = true;
        $scope.generateNewAvatar();
    };

    $scope.restoreDefaultAvatar = function() {
        user.avatarUrl = $scope.initialAvatarUrl;
        $scope.isChangeAvaMenuShown = false;
        $scope.isAvaLoading = true;
    };

    $scope.imageLoadedHandler = function() {
        $scope.isAvaLoading = false;
    };

    $scope.goToLoadAvatar = function() {
        $scope.closeMenu();
        $scope.isChangeAvaMenuShown = false;
        location.href = "#/loadAvatar";
    };

    $scope.$on('$stateChangeStart',
        function(evt, toState, toParams, fromState, fromParams) {
        notification.clear();
    });

}]);