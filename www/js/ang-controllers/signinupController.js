angular.module("angControllers").controller("signinupController", 
    ['$rootScope','$scope', '$state', '$stateParams','$q','api', 'notification', 'storage', 'User', 
    function($rootScope, $scope, $state, $stateParams, $q, api, notification, storage, User) {
    
    console.log("sign in is invoked");
   
    $scope.newUser = {};
    $scope.showSpinner = false;
    $scope.isIn = $stateParams.inOrUp == "in" ? true : false;

    if ($scope.isIn) {
        notification.set("Авторизация")
    }
    else {
        notification.set("Регистрация")
    }

    $scope.handleSuccessSignIn = function(userInfo) {
        $rootScope.user.name = userInfo.name;
        $rootScope.user.channel = userInfo.channel_name;
        $rootScope.user.uuid = userInfo.uuid

        if (false) {
            $rootScope.user.chats = angular.extend({}, userDataInLS.chats) 
            $rootScope.user.friends = angular.extend({}, userDataInLS.friends) 
        }
        else {
        }

        api.subscribe($rootScope.user.channel);
        localStorage.setItem('isLogged', true);
        storage.saveUser();
        storage.saveFriends();
        console.log($rootScope.user);
        $state.go('chats');
    }

    $scope.signin = function() {
        $scope.showSpinner = true;
        api.signin($scope.newUser.name, $scope.newUser.password)
        .then(
            function setAccesssToken(res) {
                $rootScope.user = new User(res.accessToken);
            },
            function showError(res) {
                $scope.serverResponse = res.errorDescription;
                console.log(res);
                return $q.reject(); 
            }
        )
        .then(
            function() {
                api.getUserInfo($rootScope.user.accessToken).then(
                    function(userInfo) {
                        $scope.handleSuccessSignIn(userInfo);
                    },
                    function(res) {
                        console.error("sign in fail")
                    }
                )
        })
        .then(
            function() {
                $scope.showSpinner = false;
            },
            function() {
                $scope.showSpinner = false;
            }
        )
    }

    $scope.signup = function() {
        console.log("sign up is invoked");
        $scope.showSpinner = true;
        api.signup($scope.newUser.name, $scope.newUser.password)
        .then(
            function(res) {
                $scope.signin()
            },
            function(res) {
                $scope.serverResponse = res.errorDescription;
            }
        )
        .then(
            function() {
                $scope.showSpinner = false;
            },
            function() {
                $scope.showSpinner = false;
            }
        )
    }

    $scope.closeServerResponse = function() {
        $scope.serverResponse = false;
    }
}])
    