angular.module("angControllers").controller("phoneRegistrationController", 
    ['user','$scope', '$stateParams', 'contacts',
    function(user, $scope, $stateParams, contacts) {
    
    console.log('friends controller is enabled');
    $scope.user = user;

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