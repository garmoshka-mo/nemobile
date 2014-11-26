angular.module("angControllers").controller("loginController", ['$rootScope','$scope', '$http', '$state','api', function($rootScope, $scope, $http, $state, api) {
    $scope.signin = function() {
    var friends = [
        {accessToken: "KsycbV1jeVW-7nB5kxVo", name: "david"}
    ]

    console.log("sign in is invoked");
    api.signin($scope.newUser.name, $scope.newUser.password)
        .then(
            function(res) {
                console.log(res);
                var data = res.data;
                if (data.success) {
                    $rootScope.user = {
                        name: $scope.newUser.name,
                        accessToken: data.access_token,
                        friends: friends.slice()
                    }
                    $state.go('friends');
                    console.log($rootScope);
                }
                else { 
                    $scope.serverResponse = data.error[1];
                }
            },
            function(res) {
                console.log(res);
            }
        )
    }
}])
    