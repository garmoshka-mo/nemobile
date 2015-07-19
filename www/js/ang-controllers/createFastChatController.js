angular.module("angControllers").controller("createFastChatController", [
    'user', '$scope', '$q',
    function(user, $scope, $q) {
        $scope.showSpinner = true;
        
        function signinAsVirtualUser() {
            var d = $q.defer();
            api.addVirtualAccount()
            .then(
                function(res) {
                    user.signin(null, null, res.access_token, true)
                    .then(
                        function() {
                            d.resolve();
                        },
                        function() {
                            d.reject();
                        }
                    );
                }
            );
            return d.promise;
        }

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

        signinAsVirtualUser()
        .then(
            function() {
                createVirtualChat()
                .then(function(senderId) {
                    $state.go('chat', {
                        senderId: senderId
                    });
                });
            }
        );
}]);