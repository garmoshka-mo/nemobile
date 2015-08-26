angular.module("angControllers").controller("createFastChatController", [
    'user', '$scope', '$q', '$stateParams', '$state',
    function(user, $scope, $q, $stateParams, $state) {
        $scope.showSpinner = true;
        $scope.serverResponse = null;
        
        function createVirtualChat() {
            return api.addVirtualAccount()
            .then(
                function(res) {

                    var chatData = {
                        senderId: res.uuid,
                        link: res.access_token,
                        title: "Виртуальный чат",
                        isVirtual: true,
                    };

                    user.addChat(chatData);
                    return chatData.senderId;
                }
            );
        }

        user.signinAsVirtualUser()
        .then(
            function() {
                if ($stateParams.senderId) {
                    $state.go('chat', {
                        senderId: $stateParams.senderId
                    });
                }
                else {
                    createVirtualChat()
                    .then(function(senderId) {
                        $state.go('chat', {
                            senderId: senderId
                        });
                    });    
                }
            }
        );
}]);