angular.module("angControllers").controller("friendsController", 
    ['user','$scope', '$stateParams',
    function(user, $scope, $stateParams) {
    console.log('friends controller is enabled');
    $scope.user = user;
    $scope.isEditMode = false;
    $scope.showAll = "0";

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

    user.friendsList.getUserContacts();
}]);