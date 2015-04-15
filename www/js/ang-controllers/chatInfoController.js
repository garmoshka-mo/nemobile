angular.module("angControllers").controller("chatInfoController", 
    ['user','$scope', '$stateParams', '$state',
    function(user, $scope, $stateParams, $state) {
        $scope.chat = user.chats[$stateParams.senderId];
        $scope.isFriend = user.friendsList.nepotomFriends[$stateParams.senderId];

        $scope.imageClickHandler = function() {
            $state.go('showImage', {
                link: $scope.chat.photoUrl
            });
        };

        $scope.addFriend = function() {
            user.addFriend($scope.chat.senderId, $scope.chat.title, {
                fullSize: $scope.chat.photoUrl,
                mini: $scope.chat.photoUrlMini
            });
            $scope.isFriend = true;
        };


}]);