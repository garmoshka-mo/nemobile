angular.module("angControllers")
.controller("pubsListController", [
    '$scope', 'posts', 'router', 'googleAnalytics',
function($scope, posts, router, googleAnalytics) {

    $scope.page = 1;
    $scope.posts = [];
    $scope.goto = router.goto;

    $scope.loadMore = function() {
        $scope.disableAutoload = true;
        $scope.loading = true;
        load($scope.page++);
    };

    function load(page) {
        posts.getPostsList(page).then(function(data){
            transform(data.list);
            Array.prototype.push.apply($scope.posts, data.list);
            $scope.disableAutoload = data.is_last_page;
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

    googleAnalytics.pageview();
}
]);
