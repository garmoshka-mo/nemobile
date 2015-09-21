angular.module("angControllers")
.controller("pubController", [
    '$scope', 'posts', '$stateParams', 'user',
function($scope, posts, $stateParams, user) {

    var id = $stateParams.postId;

    if (user.isLogged()) getPost();
    else user.signinAsVirtualUser().then(getPost);

    function getPost() {
        posts.getPost(id).then(function (data) {
            $scope.post = data.post;
        });
    }


    // Disqus:
    var disqus_shortname = 'dubink';
    (function() {
        var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
}
]);
