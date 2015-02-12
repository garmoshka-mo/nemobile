angular.module("angControllers").controller("friendsController", 
    ['user','$scope', '$stateParams',
    function(user, $scope, $stateParams) {
    console.log('friends controller is enabled');
    $scope.user = user;
    $scope.isEditMode = false;
    $scope.showAll = "0";

    $(".friend-list").scroll(function(){
        if (window.device) {
            cordova.plugins.Keyboard.close();
        }
    });

    $scope.removeFriend = function(friend) {
        user.friendsList.removeFriend(friend);
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