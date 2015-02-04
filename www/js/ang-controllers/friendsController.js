angular.module("angControllers").controller("friendsController", 
    ['user','$scope', '$stateParams', 'friendsList',
    function(user, $scope, $stateParams, friendsList) {
    console.log('friends controller is enabled');
    $scope.user = user;
    $scope.isEditMode = false;

    friendsList.getUserContacts();
    $scope.friends = friendsList.friends;
    
    $scope.removeFriend = function(friendUuid) {
        var _friends = {};

        for (var key in user.friends) {
            if (key != friendUuid) {
                _friends[key] = user.friends[key];
            }
        }

        user.friends = _friends;
        console.log("friend was deleted");
    }        

}])    