angular.module("angControllers")
.controller("pubController", [
    '$scope', 'posts', '$stateParams',
function($scope, posts, $stateParams) {

    $scope.postId = $stateParams.postId;

}
]);
