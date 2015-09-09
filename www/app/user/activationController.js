angular.module("angControllers")
.controller("activationController", [
        '$scope', 'membership', 'storage',
    function($scope, membership, storage) {
        
        membership.getOffers()
        .then(function(offers) {
            $scope.offers = offers;
        });

        $scope.order = function(offer) {
            storage.saveOrderCreated();
            membership.order(offer.id);    
        }; 
    }
]);
