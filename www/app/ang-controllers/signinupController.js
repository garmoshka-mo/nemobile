angular.module("angControllers").controller("signinupController", 
    ['user','$scope', '$state', '$stateParams','$q', 'vk', 'notification', 'dictionary',   
    function(user, $scope, $state, $stateParams, $q, vk, notification, dictionary) {
    
    log("sign in is invoked");
   
    $scope.newUser = {};
    $scope.showSpinner = false;
    $scope.isIn = $stateParams.inOrUp == "in" ? true : false;

    if ($scope.isIn) {
        notification.set("Авторизация");
    }
    else {
        notification.set("Регистрация");
    }

    $scope.signin = function() {
        $scope.showSpinner = true;
        $scope.serverResponse = "";
        user.signin($scope.newUser.name, $scope.newUser.password)
        .then(
            function() {
                $scope.showSpinner = false;
                $state.go('friends');
            },
            function(errorText) {
                $scope.showSpinner = false;
                $scope.serverResponse = dictionary.get(errorText);
            }
        );
    };

    $scope.signup = function() {
        log("sign up is invoked");
        $scope.showSpinner = true;
        user.signup($scope.newUser.name, $scope.newUser.password)
        .then(
            function(res) {
                $scope.signin();
            },
            function(errorText) {
                $scope.serverResponse = dictionary.get(errorText);
                $scope.showSpinner = false;
            }
        );
    };

    $scope.signinVk = function() {
        vk.auth()
        .then(function(res) {
            user.socialSignin("vkontakte", res.vkUserId, res.vkAccessToken)
            .then(
                function() {
                    $state.go('chats');
                }
            );
        });
    };

}]);
    