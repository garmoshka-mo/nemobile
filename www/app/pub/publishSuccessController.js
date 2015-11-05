angular.module("angControllers")
.controller("publishSuccessController", [
    '$scope', 'router', 'posts', '$stateParams', 'separator', 'notification',
function($scope, router, posts, $stateParams, separator, notification) {

    $scope.router = router;
    $scope.separator = separator;

    $scope.postUrl = config('appUrl') + '/pub/' + $stateParams.postId + '/view';

    $scope.startNewChat = function() {
        notification.chatDisconnect();
        router.goto('random');
    };

    if(!router.isTopSectionActive()) {
        router.changeChatState('randomLaunch');
    }
}
]);
