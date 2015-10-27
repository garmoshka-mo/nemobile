angular.module("angControllers")
.controller("postsControl", [
    '$scope', 'posts', '$stateParams', 'user', 'router', 'separator', 'userRequest',
function($scope, posts, $stateParams, user, router, separator, userRequest) {

    $scope.posts = posts;

    separator.setMainFooter($('#posts-control'));

    $scope.externalURL = function() {
        if (!posts.activePost) return;

        router.openExternalURL('/pub/' + posts.activePost.id + '/view')
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
    };

    $scope.saveTag = function() {
        var url = '/posts/' + posts.activePost.id + '/reset_tag/' + posts.activePost.tag;
        userRequest.sendForSure('PATCH', url);
    };
}
]);
