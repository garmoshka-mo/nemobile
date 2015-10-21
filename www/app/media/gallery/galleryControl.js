angular.module("angControllers")
.controller("galleryControl", [
    '$scope', 'router', 'separator',
function($scope, router, separator) {
    separator.setMainFooter($('#posts-control'));
}
]);
