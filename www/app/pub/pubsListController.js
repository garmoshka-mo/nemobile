angular.module("angControllers")
.controller("pubsListController", [
    '$scope', 'posts', 'router', '$anchorScroll', '$location',
function($scope, posts, router, $anchorScroll, $location) {

    $scope.page = 1;
    $scope.posts = [];
    $scope.goto = router.goto;

    if(!router.isChatActive() && !router.isRandomLaunchActive() && !router.isRandomActive()) {
        router.openOnTop('randomLaunch');
    }

    $scope.loadMore = function() {
        $scope.disableAutoload = true;
        $scope.loading = true;
        load($scope.page++);
    };

    function load(page) {
        posts.getPostsList(page).then(function(data){
            transform(data.list);
            Array.prototype.push.apply($scope.posts, data.list);
            $scope.disableAutoload = data.is_last_page || data.list.length == 0;
            $scope.loading = false;
        });
    }

    function transform(arr) {
        arr.map(function(p) {
            p.slug = encodeURIComponent(
                p.title.replace(/ /g, '-')
                    .replace(/[\.\/]/g, '')
            );
        });
    }

    $scope.saveState = function(post){
        post.visited = true;
        router.saveState({
            posts: $scope.posts,
            page: $scope.page,
            disableAutoload: $scope.disableAutoload,
            lastVisitedPost: post.id
        });
    };

    $scope.loadSaved = function(){
        var state = router.loadState();
        if(state) {
            $scope.page = state.page;
            $scope.posts = state.posts;
            $scope.disableAutoload = state.disableAutoload;

            var newHash = 'post-' + state.lastVisitedPost;
            if ($location.hash() !== newHash) {
                // set the $location.hash to `newHash` and
                // $anchorScroll will automatically scroll to it
                $location.hash(newHash);
            } else {
                // call $anchorScroll() explicitly,
                // since $location.hash hasn't changed
                $anchorScroll();
            }
            return true;
        }
        return false;
    }
}
]);
