angular.module("angControllers")
.controller("pubController", [
    '$scope', 'posts', '$stateParams', 'user', 'router', 'disqus',
function($scope, posts, $stateParams, user, router, disqus) {

    var id = $stateParams.postId;
    $scope.router = router;

    if (user.isLogged()) getPost();
    else user.signinAsVirtualUser().then(getPost);

    function getPost() {
        posts.getPost(id).then(function (data) {
            $scope.post = data.post;
            disqus.load(id, data.post.title);
        });
    }
}
]);
