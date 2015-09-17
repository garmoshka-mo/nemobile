angular.module("angControllers").controller("menuController", ['$scope', '$stateParams', '$state', '$timeout', '$http', 'sound',
    function($scope, $stateParams, $state, $timeout, $http, sound) {

        $scope.showChangeAvatarMenu = false;
        $scope.isAvaLoading = false;
        $scope.isMenuOpened = false;
        $scope.fullMode = config('fullMode');
        $scope.debug = config('debug');

        $scope.generateNewAvatar = function() {
            var newGuid = Math.round(Math.random() * 10000);
            user.avatar.urlMini = config('adorableUrl') + "/40/" + newGuid;
            $scope.isChangeAvaMenuShown = true;
            $scope.isAvaLoading = true;

            $scope.applyCurrentAvatar = function() {
                $scope.isChangeAvaMenuShown = false;
                user.avatar.updateGuid(newGuid);
                user.save();
            };
        };

        $scope.showChangeAvatarMenu = function() {
            $scope.initialAvatarUrl = user.avatar.urlMini;
            $scope.isChangeAvaMenuShown = true;
            $scope.generateNewAvatar();
        };

        $scope.restoreDefaultAvatar = function() {
            user.avatar.urlMini = $scope.initialAvatarUrl;
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
            user.avatar.urlMini = $scope.initialAvatarUrl;
        };

        $scope.countUnreadChats = function () {
            $scope.unreadChatsAmount = 0;

        };

        function objectToString(object) {
            var cache = [];

            return JSON.stringify(object, function(key, value) {
                if (typeof value === 'object' && value !== null) {
                    if (cache.indexOf(value) !== -1) {
                        // Circular reference found, discard key
                        return;
                    }
                    // Store value in our collection
                    cache.push(value);
                }
                return value;
            });
        }

        $scope.sendDebugInfo = function () {
            var currentScope = angular.element(document.getElementsByClassName('content')[0]).scope();
            $scope.showDebugPreloader = true;
            // $http.post('http://localhost:5000', {msg: objectToString(currentScope)})
            $http.post('http://dubink-logger.herokuapp.com/', {msg: objectToString(currentScope)})
            .success(function(data) {
                $scope.showDebugPreloader = false;
                prompt('Слепок №' + data + ' создан', 'http://dubink-logger.herokuapp.com/log' + data + ".txt");
            });
        };

        $scope.soundEnabled = sound.isEnabled();

        $scope.toggleSound = function() {
            sound.toggle();
            sound.play('incomeMessage');
            //update flag state after toggle
            $scope.soundEnabled = sound.isEnabled();
        };

}]);
    