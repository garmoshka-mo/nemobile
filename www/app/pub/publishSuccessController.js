angular.module("angControllers")
.controller("publishSuccessController", [
    '$scope', 'router', 'chats', 'posts', '$stateParams',
function($scope, router, chats, posts, $stateParams) {

    $scope.router = router;
    $scope.chats = chats;

    $scope.postUrl = 'http://dub.ink/pub/' + $stateParams.postId + '/view';
}
]);
