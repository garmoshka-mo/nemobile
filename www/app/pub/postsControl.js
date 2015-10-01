angular.module("angControllers")
.controller("postsControl", [
    '$scope', 'posts', '$stateParams', 'user', 'router',
function($scope, posts, $stateParams, user, router) {

    $scope.posts = posts;

    $scope.externalURL = function() {
        if (!posts.activePost) return;

        router.openExternalURL(posts.activePost.data.link.url)
    };

    $scope.like = function() {
        if (!posts.activePost) return;
        if(posts.activePost.my_score) return;

        posts.likePost(posts.activePost.id)
        .then(function(){
            posts.activePost.my_score = 1;
        });
    };

    $scope.dislike = function() {
        if (!posts.activePost) return;

        posts.deletePost(posts.activePost.id)
    }
}
]);
