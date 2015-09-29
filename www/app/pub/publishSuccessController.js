angular.module("angControllers")
.controller("publishSuccessController", [
    '$scope', 'router', 'posts', '$stateParams', 'separator',
function($scope, router, posts, $stateParams, separator) {

    $scope.router = router;
    $scope.separator = separator;

    $scope.postUrl = config('appUrl') + '/pub/' + $stateParams.postId + '/view';

    $scope.startNewChat = function() {
        router.openOnTop('random');
        //notification.chatDisconnect();
        router.goto('pubsList');
    };

    if(!router.isChatActive() && !router.isRandomLaunchActive()) {
        router.openOnTop('randomLaunch');
    }
}
]);
