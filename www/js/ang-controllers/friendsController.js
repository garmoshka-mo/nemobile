angular.module("angControllers").controller("friendsController", 
    ['user','$scope', '$stateParams',
    function(user, $scope, $stateParams) {
    console.log('friends controller is enabled');
    $scope.user = user;
    $scope.isEditMode = false;
    
    var storedLastChosenList = localStorage.lastChosenList;
    if (storedLastChosenList) {
        $scope.showAll = storedLastChosenList;
    }
    else {
        $scope.showAll = "1"; // 0 - nepotom friends, 1 - all friends
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
        var templateForInvitation = "#/invitation?friendIndex=";

        if (friend.uuid) {
            return templateForNepotomUser + friend.uuid;
        }
        else {
            return templateForInvitation + user.friendsList.friends.indexOf(friend);
        }
    };

    $scope.$watch('showAll', function() {
        localStorage.lastChosenList = $scope.showAll;
    });

    user.friendsList.getUserContacts();
}]);