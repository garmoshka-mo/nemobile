angular.module("angControllers")
.controller("pubController", [
    '$scope', 'posts', '$stateParams', 'user',
function($scope, posts, $stateParams, user) {

    var id = $stateParams.postId;

    if (user.isLogged()) getPost();
    else user.signinAsVirtualUser().then(getPost)

    function getPost() {
        posts.getPost(id).then(function (data) {
            $scope.post = data.post;
            //score without user's vote
            $scope.post.score -= data.my_rate;

            $scope.liked = data.my_rate ===  1;
            $scope.disliked = data.my_rate === -1;

            $scope.duration = $scope.post.chat.duration_s.toHHMMSS();
        });
    }

    // Disqus:
    var disqus_shortname = 'dubink';
    (function() {
        var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();

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
                    window.history.back();
                }, 500);
            });
        }
    }
}
]);
