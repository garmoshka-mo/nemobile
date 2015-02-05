angular.module("angControllers").controller("friendsController", 
    ['user','$scope', '$stateParams',
    function(user, $scope, $stateParams) {
    console.log('friends controller is enabled');
    $scope.user = user;
    $scope.isEditMode = false;
    $scope.showAll = "0";

    $scope.removeFriend = function(friendUuid) {
        var _friends = {};

        for (var key in user.friends) {
            if (key != friendUuid) {
                _friends[key] = user.friends[key];
            }
        }

        user.friends = _friends;
        console.log("friend was deleted");
    };

    user.friendsList.getUserContacts();
}]);