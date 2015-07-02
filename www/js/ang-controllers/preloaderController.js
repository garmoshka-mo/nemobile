angular.module("angControllers").controller("preloaderController", ['$scope', '$stateParams', '$state', '$timeout',  
    function($scope, $stateParams, $state, $timeout) {
        $timeout(function() {
            $state.go($stateParams.stateToGo);  
        }, 300);
}]);
    