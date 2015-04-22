angular.module("angControllers").controller("friendsController", 
    ['user','$scope', '$stateParams',
    function(user, $scope, $stateParams) {
    console.log('friends controller is enabled');
    $scope.user = user;
    $scope.isEditMode = false;
    $scope.limitTo = 20;

    var storedLastChosenList = localStorage.lastChosenList;
    if (storedLastChosenList) {
        $scope.showAll = storedLastChosenList;
    }
    else {
        $scope.showAll = "2"; // 0 - nepotom friends, 1 - all friends, 2 - newest friends
    }

    $scope.hideKeyboard = function() {
        console.log("keyboard is hidden");
        if (window.device) {
            cordova.plugins.Keyboard.close();
        }
    };

    $scope.removeFriend = function(event, friend) {
        user.friendsList.removeFriend(friend);
        event.preventDefault();
    };

    $scope.getFriendLink = function(friend) {
        var templateForNepotomUser = "#/chat?senderId=";
        var templateForVirtualChat = "#/addVirtualChat?friendIndex=";

        if (friend.uuid) {
            return templateForNepotomUser + friend.uuid;
        }
        else {
            return templateForVirtualChat + user.friendsList.friends.indexOf(friend);
        }
    };

    $scope.getNextLimit = function() {
        $scope.limitTo = $scope.limitTo + 20; 
    };

    $scope.getFriendImage = function(friend, index) {
        var adorableLink = "http://api.adorable.io/avatars/40/";

        if (friend.photos) {
            return friend.photos[0].valueMini ? 
                friend.photos[0].valueMini : friend.photos[0].value;
        }

        if (friend.uuid) {
            return adorableLink + friend.uuid;
        }

        return adorableLink + index;
    };

    $scope.$watch('showAll', function() {
        localStorage.lastChosenList = $scope.showAll;
    });

    if (!user.isParsingFromStorageNow) {
        user.friendsList.getUserContacts();
    }
}]);