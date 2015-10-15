angular.module('angServices').service('gallery', [
    '$rootScope',
    function($rootScope) {
        var self = this;
        //self.send(
    }]);

angular.module("angControllers").controller("galleryPanelController", [
    '$scope', 'gallery',
    function($scope, gallery){
        $scope.g = gallery;
    }]);

angular.module("angControllers").controller("galleryController", [
    '$scope', 'gallery', 'router',
    function($scope, gallery, router){
        if(!router.isChatActive()) {
            //redirect on page reload
            router.goto('pubsList');
        }
        $scope.g = gallery;
    }]);