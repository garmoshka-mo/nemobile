angular.module("angControllers").controller("virtualChatController", [
    'user', '$scope', '$stateParams', 'router',
    function(user, $scope, $stateParams, router) {
        $scope.showSpinner = true;
        
        function handleSuccessSignin() {
            user.getUnseenMessages()
            .then(function() {
                $scope.showSpinner = false;
                $scope.isEmpty = true;

                log("Q!!!!!!!!!!!!!!", user.chats);
                if (!_.isEmpty(user.chats)) {
                    var senderId = Object.keys(user.chats)[0];
                    router.goto('chat', {senderId: senderId});
                }
            });
        }

        if (user.isLogged()) { 
            user.logout()
            .then(function() {
                user.signin(null, null, $stateParams.at, true)
                .then(function() {
                    handleSuccessSignin();
                });
            });
        }
        else {
            user.signin(null, null, $stateParams.at, true)
            .then(function() {
                handleSuccessSignin();
            });
        }
}]);