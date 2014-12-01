angular.module("angControllers").controller("registrationController", ['$rootScope','$scope', '$http', 'api', function($rootScope, $scope, $http, api) {

    $scope.signup = function() {
        console.log("sign up is invoked");
        api.signup($scope.newUser.name, $scope.newUser.password)
        .then(
            function(res) {
                $scope.serverResponse = "Вы успешно зарегистрированы"
            },
            function(res) {
                $scope.serverResponse = res.errorDescription;
            }
        )
    }
}])
