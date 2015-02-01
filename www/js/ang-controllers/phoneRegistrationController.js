angular.module("angControllers").controller("phoneRegistrationController", 
    ['user','$scope', '$stateParams', 'contacts',
    function(user, $scope, $stateParams) {
        $scope.newUser = {};
        $scope.showSpinner = false;
        $scope.phoneEnterPhase = true;
        var $phoneInput = $("#mobile-number").intlTelInput();
        $scope.initRegistration = function () {
            $scope.showSpinner = true;
            user.initRegistrationWithPhone($scope.newUser.phone)
            .then(
                function () {
                    $scope.phoneEnterPhase = false;
                    $scope.showSpinner = false;
                },
                function () {
                    $scope.showSpinner = false;
                }
            )    
        }

        $scope.goToEnterPhase = function () {
            $scope.phoneEnterPhase = true;
        }

        $scope.bindInputToModal = function (event) {
            console.log(event);
        }

}])    