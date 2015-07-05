angular.module("angControllers").controller("friendsController", 
    ['user','$scope', '$stateParams', '$timeout',
    function(user, $scope, $stateParams, $timeout) {
    console.log('friends controller is enabled');
    $scope.user = user;
    $scope.isEditMode = false;
    $scope.limitTo = 20;
    $scope.showSpinner = false;

    var storedLastChosenList = localStorage.lastChosenList;
    if (storedLastChosenList) {
        $scope.listToShow = storedLastChosenList;
    }
    else {
        $scope.listToShow = "new"; 
    }

    $scope.shownList = $scope.listToShow;

    $scope.hideKeyboard = function() {
        console.log("keyboard is hidden");
        if (RAN_AS_APP) {
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

    $scope.showSpinner = false;
    $scope.$watch('listToShow', function(newValue, oldValue) {
        $scope.showSpinner = true;
        $timeout(function() {
            $scope.shownList = newValue;
            $scope.showSpinner = false;
            localStorage.lastChosenList = newValue;
        },100);
    });

    if (!user.isParsingFromStorageNow && !user.friendsList.gotUserContacts) {
        user.friendsList.getUserContacts();
    }
}]);