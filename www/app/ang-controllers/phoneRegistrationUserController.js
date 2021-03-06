angular.module("angControllers").controller("phoneRegistrationUserController", 
    ['user','$scope', '$stateParams', '$state',
    function(user, $scope, $stateParams, $state) {
        $scope.newUser = {};
        $scope.showSpinner = false;
        $scope.screenToShow = "phoneEnter";
        $scope.showSuccess = false;
        $scope.serverResponse = "";

        $scope.attachPhoneNumber = function () {
            $scope.showSpinner = true;
            $scope.showSuccess = false;
            var phone = "+" + $scope.newUser.phone;
            user.attachPhoneNumber(phone)
            .then(
                function () {
                    $scope.screenToShow = "phoneConfirm";
                    $scope.showSpinner = false;
                    $scope.serverResponse = "";
                },
                function (err) {
                    $scope.showSpinner = false;
                    $scope.serverResponse = err;
                }
            ) ;   
        };

        $scope.confirmPhoneNumber = function() {
            $scope.showSpinner = true;
            var phone = "+" + $scope.newUser.phone;
            user.confirmPhoneNumber(phone, $scope.newUser.confirmCode, true)
            .then(
                function(res) {
                    $scope.showSpinner = false;
                    $scope.showSuccess = true;
                    $scope.serverResponse = "";
                },
                function(res) {
                    $scope.showSpinner = false;
                    $scope.serverResponse = "Ошибка. Проверьте правильность кода";
                    log(res);
                }
            );
        };

        $scope.attachViaSms = function() {
            window.plugins.socialsharing.shareViaSMS(
                user.accessToken, config('phoneToSendSms'),
                function(msg) {
                    log('ok: ' + msg);
                    $scope.screenToShow = "seccessfulSmsSending";
                },
                function(msg) {
                    log('error: ' + msg);
                }
            );
        };

        $scope.goToEnterPhase = function() {
            $scope.screenToShow = 'phoneEnter';
        };

        $scope.closeServerResponse = function() {
            $scope.serverResponse = "";
        };


}]);   