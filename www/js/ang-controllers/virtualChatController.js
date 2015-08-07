angular.module("angControllers").controller("virtualChatController", [
    'user', '$scope', '$stateParams', 'routing', 
    function(user, $scope, $stateParams, routing) {
        $scope.showSpinner = true;
        
        function handleSuccessSignin() {
            user.getUnseenMessages()
            .then(function() {
                $scope.showSpinner = false;
                $scope.isEmpty = true;

                if (!_.isEmpty(user.chats)) {
                    var senderId = Object.keys(user.chats)[0];
                    routing.goto('chat', {senderId: senderId});
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