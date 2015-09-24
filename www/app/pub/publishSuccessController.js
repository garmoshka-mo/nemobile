angular.module("angControllers")
.controller("publishSuccessController", [
    '$scope', 'router', 'chats', 'posts', '$stateParams',
function($scope, router, chats, posts, $stateParams) {

    $scope.router = router;
    $scope.chats = chats;

    $scope.postUrl = config('appUrl') + '/pub/' + $stateParams.postId + '/view';

    $scope.startNewChat = function() {
        if ($stateParams.channel) {
            chats.getChat($stateParams.channel).disconnect();
        }
        router.goto('random');
    }
}
]);
