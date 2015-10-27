angular.module("angControllers")
.controller("pubController", [
    '$scope', 'posts', '$stateParams', 'user', 'router', 'disqus',
function($scope, posts, $stateParams, user, router, disqus) {

    separator.resize('hide');
    
    var id = $stateParams.postId;
    $scope.router = router;

    if (user.isLogged()) getPost();
    else user.signinAsVirtualUser().then(getPost);

    function getPost() {
        posts.getPost(id).then(function (data) {
            $scope.post = data.post;
            //score without user's vote
            $scope.post.score -= data.my_rate;

            $scope.liked = data.my_rate ===  1;
            $scope.disliked = data.my_rate === -1;

            //$scope.post.duration = $scope.post.chat.duration_s ?
            //        $scope.post.chat.duration_s.toHHMMSS() : 0;

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
            posts.deletePost(id).then(function () {
                $scope.liked = false;
                $scope.disliked = true;
                //short delay in order to bring the feel of actual downvoting
                setTimeout(function() {
                    router.goto('pubsList');
                }, 500);
            });
        }
    };

    $scope.externalURL = function() {
        router.openExternalURL($scope.post.data.link.url)
    };

}
]);
