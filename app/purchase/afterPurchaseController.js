angular.module("angControllers")
.controller("afterPurchaseController", [
        'user', '$scope', 'membership', 'router',
    function(user, $scope, membership, router) {

        $scope.user = user;
        $scope.showSpinner = false;
        $scope.profile = {};

        membership.getMembership().then(function(membership) {
            $scope.isActiveMembership = membership.active;
            $scope.membershipState = membership.order_status;
        });

        $scope.tryAgain = function() {
            router.goto('activation');
        };

        $scope.skipRegistration = function() {
            membership.skipRegistration();
            router.goto('random');
        };

        $scope.updateProfile = function () {
            $scope.showSpinner = true;

            user.updateProfile($scope.profile.password, $scope.profile.password)
                .then(
                function () {
                    router.goto('random');
                },
                function (res) {
                    $scope.serverResponse = dictionary.get(res);
                })
        };
    }
]);
