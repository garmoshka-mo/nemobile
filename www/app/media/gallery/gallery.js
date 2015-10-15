angular.module('angServices').service('gallery', [
    '$rootScope',
    function($rootScope) {
        var self = this;
        var sendMessageHandler = null;

        self.galleryPanelOpened = false;

        self.setSendMessageHandler = function(handler) {
            sendMessageHandler = handler;
        };
        self.sendMessage = function(message) {
            if (sendMessageHandler) {
                sendMessageHandler(message);
            }
        };
    }]);

angular.module("angControllers").controller("galleryPanelController", [
    '$scope', 'gallery',
    function($scope, gallery){
        $scope.g = gallery;

        $scope.smileys = ['?','?','?','?','☺','️'];
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