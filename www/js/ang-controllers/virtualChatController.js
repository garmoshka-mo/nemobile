angular.module("angControllers").controller("virtualChatController", [
    'user', '$scope', '$stateParams',
    function(user, $scope, $stateParams) {
        $scope.showSpinner = true;
        if (user.isLogged()) { 
            user.logout()
            .then(function() {
                user.signin(null, null, $stateParams.at, true)
                .then(function() {
                    $scope.showSpinner = false;
                    $scope.isEmpty = true;
                    if ($scope.isEmpty) {
                        console.log("empty chat");
                    }
                });
            });
        }
        else {
            user.signin(null, null, $stateParams.at, true)
            .then(function() {
                $scope.showSpinner = false;
            });
        }
}]);