angular.module("angControllers")
.controller("afterPurchaseController", [
         'user', '$scope', '$state', 'membership', 'random', 'storage', 'routing',
    function(user, $scope, $state, membership, storage, routing) {

        membership.getMembership().then(function(membership) {
            $scope.isActiveMembership = membership.active;
            $scope.membershipState = membership.order_status;
        });

        $scope.tryAgain = function() {
            routing.goto('activation');
        }

        $scope.skipRegistration = function() {
            membership.skipRegistration();
        }
    }
]);
