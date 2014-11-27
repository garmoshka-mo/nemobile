angular.module("angControllers").controller("loginController", ['$rootScope','$scope', '$http', '$state','api', function($rootScope, $scope, $http, $state, api) {
    $scope.signin = function() {
    var friends = {
        "5bc1a59a-7402-11e4-9759-86a7bd11e1af": {name: "david"}
    }

    console.log("sign in is invoked");
    api.signin($scope.newUser.name, $scope.newUser.password)
        .then(
            function(res) {
                $rootScope.user = {
                    name: $scope.newUser.name,
                    accessToken: res.accessToken,
                    friends: angular.extend({}, friends),
                    chats: {}
                }
            },
            function(res) {
                $scope.serverResponse = res.errorDescription;
                console.log(res);
            }
        )
        .then(function() {
            api.getUserInfo($rootScope.user.accessToken).then(
                function(userInfo) {
                    console.log(userInfo);
                    $rootScope.user.channel = userInfo.channel_name;
                    $rootScope.user.uuid = userInfo.uuid
                    api.subscribe($rootScope.user.channel);
                    console.log($rootScope.user);
                    $state.go('chats');
                },
                function(res) {
                    console.log("fail")
                }
            )
        })
    }
}])
    