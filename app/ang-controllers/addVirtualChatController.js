angular.module("angControllers").controller("addVirtualChatController", 
    ['user','$scope', '$stateParams', '$state', 'api', 'chats',
    function(user, $scope, $stateParams, $state, api, chats) {
        $scope.showSpinner = true;
        api.addVirtualAccount()
        .then(
            function(res) {
                var friend = {};
                //var friend = user.friendsList.friends[$stateParams.friendIndex];
                //user.friendsList.transferToNepotomFriends($stateParams.friendIndex, res.uuid);

                var chatData = {
                    senderId: res.uuid,
                    link: res.access_token,
                    title: friend.displayName,
                    isVirtual: true,
                    friendIndex: $stateParams.friendIndex
                };
                if (friend.photos) {
                    chatData.photoUrl = friend.photos[0].value;
                    chatData.photoUrlMini = friend.photos[0].valueMini ?
                        friend.photos[0].valueMini : friend.photos[0].value;
                }
                chats.addChat(chatData);
                $state.go('chat', {
                    senderId: chatData.senderId
                });
            }
        );
}]);