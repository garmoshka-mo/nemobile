angular.module("angControllers").controller("signinupController", 
    ['user','$scope', '$state', '$stateParams','$q', 'vk', 'notification',   
    function(user, $scope, $state, $stateParams, $q, vk, notification) {
    
    console.log("sign in is invoked");
   
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
                $scope.serverResponse = errorText;
            }
        );
    };

    $scope.signup = function() {
        console.log("sign up is invoked");
        $scope.showSpinner = true;
        user.signup($scope.newUser.name, $scope.newUser.password)
        .then(
            function(res) {
                $scope.signin();
            },
            function(errorText) {
                $scope.serverResponse = errorText;
                $scope.showSpinner = false;
            }
        );
    };

    $scope.signinVk = function() {
        vk.auth()
        .then(function() {
            vk.getUser()
            .then(
                function(res) {
                    console.log(res);
                }
            );
        });
    };

}]);
    