angular.module("angControllers")
.controller("pubsListController", [
    '$scope', 'posts', 'router', '$anchorScroll', '$location',
        '$timeout', 'socket', '$rootScope',
function($scope, posts, router, $anchorScroll, $location,
         $timeout, socket, $rootScope) {

    posts.currentPage = 1;
    $scope.posts = posts.items;
    $scope.goto = router.goto;

    $rootScope.mainFooterTemplate = 'app/pub/postsControl.html?'+version;

    $scope.loadMore = function() {
        if ($scope.loading) return;
        posts.disableAutoload = true;
        $scope.loading = true;
        log('page of infinite scroll:', posts.currentPage++);
        load();
    };

    var activePost;
    $scope.postVisibility = function(inview, post) {
        if (!inview && activePost == post)
            post = null;

        if (activePost != post) {
            activePost = post;
            posts.activePost = post;
        }
    };

    function load() {
        socket.emit('posts', {get: 'random items'});
    }

    socket.on('posts', function(envelope) {
        log('received posts:', envelope.posts);
        transform(envelope.posts);

        $scope.$apply(function() {
            Array.prototype.push.apply(posts.items, envelope.posts);
            posts.disableAutoload = envelope.posts.length == 0;
            $scope.loading = false;
        });
    });

    function transform(arr) {
        arr.map(function(p) {
            if (!p.title) p.title = '';
            p.slug = encodeURIComponent(
                p.title.replace(/ /g, '-')
                    .replace(/[\.\/]/g, '')
            );
        });
    }

    $scope.loadSaved = function(){
        if(posts.lastVisitedPost) {
            var newHash = 'post-' + posts.lastVisitedPost;
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
    };

    $scope.postUrl = function() {
        if (!$scope.url || $scope.url.length < 10) {
            $scope.postUrlNotice = 'pubs.notice.emptyUrl';
            return;
        }

        $scope.publishing = true;
        var data = {
            title: $scope.title || Date.now().toDateTime(),
            link: {
                url: $scope.url
            }
        };
        posts.publishPost(data).then(function (data) {
            $scope.publishing = false;
            $scope.url = '';
            $scope.postUrlNotice = 'pubs.notice.publish';
        });
    };

    $scope.cutImage = function(post) {
        post.cutImage = true;
    }

}
]);

app.directive('cutImage', function() {
    var $window  = $(window);
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function() {
                var height = $(this).height();
                if (height > $window.height() * 1.3) {
                    //log(height, $window.height());
                    //scope.$apply(attrs.cutImage = true);
                    scope.$apply(attrs.cutImage);
                }
                // scope.$apply(attrs.imageonload);
            });
        }
    };
});
