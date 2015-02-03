angular.module("angControllers").controller("phoneRegistrationController", 
    ['user','$scope', '$stateParams', '$state',
    function(user, $scope, $stateParams, $state) {
        $scope.newUser = {};
        $scope.showSpinner = false;
        $scope.phoneEnterPhase = true;
        $scope.serverResponse = "";

        $scope.initRegistration = function () {
            $scope.showSpinner = true;
            var phone = "+" + $scope.newUser.phone;
            user.initRegistrationWithPhone(phone)
            .then(
                function () {
                    $scope.phoneEnterPhase = false;
                    $scope.showSpinner = false;
                    $scope.serverResponse = "";
                },
                function (err) {
                    $scope.showSpinner = false;
                    $scope.serverResponse = "Ошибка. Проверьте правильность номера";
                }
            )    
        }

        $scope.confirmPhoneNumber = function() {
            $scope.showSpinner = true;
            var phone = "+" + $scope.newUser.phone;
            user.confirmPhoneNumber(phone, $scope.newUser.confirmCode)
            .then(
                function(res) {
                    $scope.showSpinner = true;
                    $scope.serverResponse = "";
                    $state.go('chats');
                },
                function(res) {
                    $scope.showSpinner = false;
                    $scope.serverResponse = "Ошибка. Проверьте правильность кода";
                    console.log(res);
                }
            )
        }

        $scope.goToEnterPhase = function () {
            $scope.phoneEnterPhase = true;
        }

        $scope.closeServerResponse = function() {
            $scope.serverResponse = "";
        }


}])    