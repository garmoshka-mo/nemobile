angular.module("angControllers")
.controller("afterPurchaseController", [
         'user', '$scope', 'externalChat', 'updates', '$state', 'notification', 'membership', 'random', 'storage',
    function(user, $scope, externalChat, updates, $state, notification, membership, random, storage) {

        membership.getMembership().then(function(membership) {
            $scope.isActiveMembership = membership.active;
            $scope.membershipState = membership.order_status;
        });

        $scope.tryAgain = function() {
            $state.go('activation');
        }

        $scope.skipRegistration = function() {
            storage.setSkipRegistration();
            //TODO: Where should we go, if we skip the registration
            //$state.go( );
        }
    }
]);
