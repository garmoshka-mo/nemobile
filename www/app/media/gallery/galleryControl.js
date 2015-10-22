angular.module("angControllers")
.controller("galleryControl", [
    '$scope', 'router', 'separator', 'gallery', '$rootScope',
function($scope, router, separator, gallery, $rootScope) {
    separator.setMainFooter($('#posts-control'));
    $scope.r = $rootScope;

    $scope.sendGfy = function(gfyPost) {
        gallery.sendGfy(gfyPost.gfy);
    }
}
]);
