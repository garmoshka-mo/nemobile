angular.module("angControllers").controller("localForageController", function($scope, $http, $location, $state, $localForage, notification){  
    console.log("localforage is enabled");
    localforage.clear();
    $scope.messages = [];
    $scope.messageLength = 10;
    $scope.messagesAmount = 10;
    $scope.isMessagesSaved = false;


    function generateString(length) {
        var bufferArr = []
        for (var i = 0; i < length; i++) {
            bufferArr.push(String.fromCharCode(48 + Math.random() * 9))
        }
        return bufferArr.join('');
    }

    $scope.generateMessages = function() {
        $scope.isMessagesSaved = false;
        $scope.messages = [];
        for (var i = 0; i < $scope.messagesAmount; i++) {
            $scope.messages.push(generateString($scope.messageLength))
        }
        $scope.saveLocal();
    };

    $scope.saveLocal = function() {
        $localForage.clear();
        $localForage.setItem('messages', $scope.messages)
        .then(function() {
            $scope.isMessagesSaved = true;
        })
    }

    $scope.getRandomMessage = function() {
        var startTime = new Date();
        $localForage.getItem('messages')
        .then(function(res) {
            $scope.randomIndex = Math.round(Math.random() * $scope.messagesAmount);
            $scope.randomMessageText = res[$scope.randomIndex];
            $scope.takenTime = new Date() - startTime;
        })
    }
});