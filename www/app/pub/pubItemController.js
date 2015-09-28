angular.module("angControllers")
.controller("pubController", [
    '$scope', 'posts', '$stateParams', 'user', 'router', 'disqus',
function($scope, posts, $stateParams, user, router, disqus) {

    var id = $stateParams.postId;
    $scope.router = router;

    router.backHandler = function() {
        router.goto('pubsList');
    };

    if (user.isLogged()) getPost();
    else user.signinAsVirtualUser().then(getPost);

    function getPost() {
        posts.getPost(id).then(function (data) {
            $scope.post = data.post;
            //score without user's vote
            $scope.post.score -= data.my_rate;

            $scope.liked = data.my_rate ===  1;
            $scope.disliked = data.my_rate === -1;

            $scope.duration = $scope.post.chat.duration_s ?
                    $scope.post.chat.duration_s.toHHMMSS() : 0;

            disqus.load(id, data.post.title);
        });
    }

    $scope.like = function() {
        if(!$scope.post.liked){
            posts.likePost(id).then(function(){
                $scope.liked = true;
                $scope.disliked = false;
            });
        }
    };

    $scope.dislike = function() {
        if(!$scope.post.disliked) {
            posts.dislikePost(id).then(function () {
                $scope.liked = false;
                $scope.disliked = true;
                //short delay in order to bring the feel of actual downvoting
                setTimeout(function() {
                    router.backHandler();
                }, 500);
            });
        }
    }
}
]);
