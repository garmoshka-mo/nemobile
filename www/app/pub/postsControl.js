angular.module("angControllers")
.controller("postsControl", [
    '$scope', 'posts', '$stateParams', 'user', 'router', 'separator',
function($scope, posts, $stateParams, user, router, separator) {

    $scope.posts = posts;

    separator.setMainFooter($('#posts-control'));

    $scope.externalURL = function() {
        if (!posts.activePost) return;

        router.openExternalURL(posts.activePost.data.link.url)
    };

    $scope.like = function() {
        if (!posts.activePost) return;

        //If already liked
        if(posts.activePost.my_score) {
            posts.unlikePost(posts.activePost.id)
                .then(function(){
                    posts.activePost.my_score = 0;
                });
        }
        else {
            posts.likePost(posts.activePost.id)
                .then(function(){
                    posts.activePost.my_score = 1;
                });
        }


    };

    $scope.dislike = function() {
        if (!posts.activePost) return;

        posts.deletePost(posts.activePost.id)
    }
}
]);