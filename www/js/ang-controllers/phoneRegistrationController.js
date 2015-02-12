angular.module("angControllers").controller("phoneRegistrationController", 
    ['user','$scope', '$stateParams', '$state',
    function(user, $scope, $stateParams, $state) {
        $scope.newUser = {};
        $scope.showSpinner = false;
        $scope.screenToShow = "phoneEnter";
        $scope.serverResponse = "";

        var timesCheckedSmsRegistration = 0;

        function generateCode(codeLength) {
            var string = "";

            for (var i = 0; i < codeLength; i++) {
                var charCode = Math.round(Math.random() * 9) + 48;
                string += String.fromCharCode(charCode); 
            }

            console.log(string);
            return string;
        }

        function checkSmsRegistration(activationCode) {
            user.confirmPhoneNumber(null, activationCode)
            .then(
                function() {
                    $scope.showSpinner = false;
                    $scope.serverResponse = "";
                    $state.go('chats');
                },
                function(res) {
                    timesCheckedSmsRegistration++;
                    if (timesCheckedSmsRegistration > 10) {
                        $scope.showSpinner = false;
                        $scope.serverResponse = "Произошла ошибка \n Попробуйте альтернативный способ регистрации";
                        console.log("10 times registration was checked");
                    }
                    else { 
                        setTimeout(checkSmsRegistration, 500);
                    }
                    console.log(res);
                }

            );
        }

        $scope.initRegistration = function () {
            $scope.showSpinner = true;
            var phone = "+" + $scope.newUser.phone;
            user.initRegistrationWithPhone(phone)
            .then(
                function () {
                    $scope.screenToShow = "phoneConfirm";
                    $scope.showSpinner = false;
                    $scope.serverResponse = "";
                },
                function (err) {
                    $scope.showSpinner = false;
                    $scope.serverResponse = "Ошибка. Проверьте правильность номера";
                }
            );
        };

        $scope.confirmPhoneNumber = function() {
            $scope.showSpinner = true;
            var phone = "+" + $scope.newUser.phone;
            user.confirmPhoneNumber(phone, $scope.newUser.confirmCode)
            .then(
                function(res) {
                    $scope.showSpinner = false;
                    $scope.serverResponse = "";
                    $state.go('chats');
                },
                function(res) {
                    $scope.showSpinner = false;
                    $scope.serverResponse = "Ошибка. Проверьте правильность кода";
                    console.log(res);
                }
            );
        };

        $scope.goToEnterPhase = function () {
            $scope.screenToShow = "phoneEnter";
        };

        $scope.goToAfterSmsSending = function() {
            $scope.screenToShow = "afterSmsSending";
            $scope.showSpinner = true;        
        };

        $scope.closeServerResponse = function() {
            $scope.serverResponse = "";
        };

        $scope.sendSms = function() {
            $scope.generatedCode = generateCode(12);
            var activationCode = "pass" + $scope.generatedCode; 
            window.plugins.socialsharing.shareViaSMS(
                activationCode, "+14845145060",
                function(msg) {
                    $scope.goToAfterSmsSending();
                    checkSmsRegistration();
                    console.log('ok: ' + msg);
                },
                function(msg) {
                    console.log('error: ' + msg);
                }
            );
        };

}]);