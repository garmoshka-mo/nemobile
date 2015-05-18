angular.module("angControllers").controller("chatInfoController", 
    ['user','$scope', '$stateParams', '$state',
    function(user, $scope, $stateParams, $state) {
        $scope.chat = user.chats[$stateParams.senderId];
        $scope.isFriend = user.friendsList.nepotomFriends[$stateParams.senderId];
        $scope.isBlocked = false;

        $scope.imageClickHandler = function() {
            $state.go('showImage', {
                link: $scope.chat.photoUrl
            });
        };

        $scope.addFriend = function() {
            var avatarObj = {
                fullSize: $scope.chat.photoUrl,
                mini: $scope.chat.photoUrlMini
            };
            var friendToAdd = {
                uuid: $scope.chat.senderId,
                name: $scope.chat.title,
                avatarObj: avatarObj 
            };
            user.addFriend(friendToAdd);
            $scope.isFriend = true;
        };

        $scope.blockUser = function() {
            console.log("user is blocked");
            user.blockUser($scope.chat.senderId);
            $scope.isBlocked = true;
        };
}]);