angular.module("angControllers").controller("menuController", ['$scope', '$stateParams', 'router', '$timeout', '$http', 'sound', '$translate',
    function($scope, $stateParams, router, $timeout, $http, sound, $translate) {

        $scope.isRussianLang = function(){
            return $translate.use() === 'ru';
        };

        $scope.isMenuOpened = false;
        $scope.fullMode = config('fullMode');
        $scope.debug = config('debugMode');

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

        // var LOGGER_URL = "http://localhost:5000/dump/";
        var LOGGER_URL = "http://dubink-logger.herokuapp.com/dump/";
        $scope.sendDebugInfo = function () {
            var currentScope = angular.element(document.getElementsByClassName('content')[0]).scope();
            $scope.showDebugPreloader = true;
            // $http.post('http://localhost:5000', {msg: objectToString(currentScope)})
            $http.post(LOGGER_URL, {text: objectToString(currentScope)})
            .success(function(data) {
                $scope.showDebugPreloader = false;
                prompt('Слепок №' + data.results[0].id + ' создан', LOGGER_URL + data.results[0].id);
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
    