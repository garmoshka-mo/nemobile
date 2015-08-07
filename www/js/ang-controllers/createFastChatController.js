angular.module("angControllers").controller("createFastChatController", [
    'user', '$scope', '$q', '$stateParams', '$state',
    function(user, $scope, $q, $stateParams, $state) {
        $scope.showSpinner = true;
        $scope.serverResponse = null;
        
        function signinAsVirtualUser() {
            var d = $q.defer();
            api.addVirtualAccount()
            .then(
                function(res) {
                    user.signin(null, null, res.access_token, true)
                    .then(
                        function() {
                            user.isVirtual = true;
                            user.save();
                            d.resolve();
                        },
                        function() {
                            d.reject();
                            $scope.serverResponse = "Произошла ошибка. Попробуйте еще раз";
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