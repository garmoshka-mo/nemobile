angular.module("angControllers")
.controller("afterPurchaseController", [
         'user', '$scope', 'externalChat', 'updates', '$state', 'notification', 'membership', 'random',
    function(user, $scope, externalChat, updates, $state, notification, membership, random) {

        membership.getMembership().then(function(membership) {
            $scope.isActiveMembership = membership.active;
            $scope.membershipState = membership.order_status;
        });

        $scope.tryAgain = function() {
            $state.go('activation');
        }
    }
]);
