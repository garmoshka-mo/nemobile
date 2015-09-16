angular.module("angControllers")
.controller("afterPurchaseController", [
        'user', '$scope', 'membership', 'routing',
    function(user, $scope, membership, routing) {

        $scope.user = user;
        $scope.showSpinner = false;
        $scope.profile = {};

        membership.getMembership().then(function(membership) {
            $scope.isActiveMembership = membership.active;
            $scope.membershipState = membership.order_status;
        });

        $scope.tryAgain = function() {
            routing.goto('activation');
        };

        $scope.skipRegistration = function() {
            membership.skipRegistration();
            routing.goto('random');
        };

        $scope.updateProfile = function () {
            $scope.showSpinner = true;

            user.updateProfile($scope.profile.password, $scope.profile.password)
                .then(
                function () {
                    routing.goto('random');
                },
                function (res) {
                    $scope.serverResponse = dictionary.get(res);
                })
        };
    }
]);
