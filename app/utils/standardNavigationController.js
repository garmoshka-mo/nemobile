angular.module("angControllers")
.controller("standardNavigationController", [
    '$scope', 'router', 'chats',
function($scope, router, chats) {

    $scope.router = router;
    $scope.chats = chats;


}
]);
