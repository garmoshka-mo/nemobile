angular.module("angControllers")
.controller("activationController", [
        '$scope', 'membership',
    function($scope, membership) {
        
        membership.getOffers()
        .then(function(offers) {
            $scope.offers = offers;
        });

        $scope.order = function(offer) {
            membership.order(offer.id);    
        }; 
    }
]);
