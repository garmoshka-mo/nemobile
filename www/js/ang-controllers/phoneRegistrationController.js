angular.module("angControllers").controller("phoneRegistrationController", 
    ['user','$scope', '$stateParams', '$state',
    function(user, $scope, $stateParams, $state) {
        $scope.newUser = {};
        $scope.showSpinner = false;
        $scope.screenToShow = "phoneEnter";
        $scope.serverResponse = "";

        var timesCheckedSmsRegistration = 0;

        function generateCode(codeLength) {
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var string = "";

            for (var i = 0; i < codeLength; i++) {
                var charCode = Math.round(Math.random() * (possible.length - 1));
                string += possible[charCode]; 
            }

            return string;
        }

        function checkSmsRegistration(accessToken) {
            console.log(timesCheckedSmsRegistration + " trying to sign in with access token " + accessToken);
            user.signin(null, null, accessToken)
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
                        setTimeout(
                            function() {
                                checkSmsRegistration(accessToken);
                            },
                            6000
                        );
                        console.log(res);
                    }
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
            $scope.serverResponse = "";
        };

        $scope.goToAfterSmsSending = function() {
            $scope.screenToShow = "afterSmsSending";
            $scope.showSpinner = true;        
        };


        $scope.sendSms = function() {
            var generatedCode = generateCode(20);
            window.plugins.socialsharing.shareViaSMS(
                "pass" + generatedCode, App.Settings.phoneToSendSms,
                function(msg) {
                    $scope.goToAfterSmsSending();
                    checkSmsRegistration(generatedCode);
                    console.log('ok: ' + msg);
                },
                function(msg) {
                    console.log('error: ' + msg);
                }
            );
        };

}]);