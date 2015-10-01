angular.module("angControllers")
.controller("postsControl", [
    '$scope', 'posts', '$stateParams', 'user', 'router',
function($scope, posts, $stateParams, user, router) {

    $scope.activePost = null;

    $scope.$on('active post', function(event, activePost) {
        $scope.activePost = activePost;
    });

    $scope.externalURL = function() {
        if (!activePost) return;

        router.openExternalURL(activePost.data.link.url)
    };

    $scope.like = function() {
        if (!activePost) return;
        if($scope.post.liked) return;

        user.ensure()
        .then(function() {
            return posts.likePost(id)
        })
        .then(function(){
            $scope.liked = true;
            $scope.disliked = false;
        });
    };

    $scope.dislike = function() {
        if (!activePost) return;
        if ($scope.post.disliked) return;

        user.ensure()
        .then(function() {
            return posts.dislikePost(id)
        })
        .then(function () {
            $scope.liked = false;
            $scope.disliked = true;
            //short delay in order to bring the feel of actual downvoting
            setTimeout(function() {
                //remove post
                //router.goto('pubsList');
            }, 500);
        });
    }
}
]);
