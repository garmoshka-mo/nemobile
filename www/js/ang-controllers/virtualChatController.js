angular.module("angControllers").controller("virtualChatController", [
    'user', '$scope', '$stateParams',
    function(user, $scope, $stateParams) {
        $scope.showSpinner = true;
        
        function handleSuccessSignin() {
            $scope.showSpinner = false;
            $scope.isEmpty = true;
            user.isVirtual = true;    
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