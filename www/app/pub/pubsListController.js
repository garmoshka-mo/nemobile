angular.module("angControllers")
.controller("pubsListController", [
    '$scope', 'posts', 'router', '$anchorScroll', '$location', '$timeout', 'socket', '$rootScope',
function($scope, posts, router, $anchorScroll, $location, $timeout, socket, $rootScope) {

    $scope.page = 1;
    $scope.posts = posts.items;
    $scope.goto = router.goto;

    if(!router.isTopSectionActive()) {
        router.openOnTop('randomLaunch');
    }

    $rootScope.mainFooterTemplate = 'app/pub/postsControl.html';

    $scope.loadMore = function() {
        $scope.disableAutoload = true;
        $scope.loading = true;
        load($scope.page++);
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

    function load(page) {
        socket.emit('posts', {get: 'random items', page: page});
    }

    socket.on('posts', function(envelope) {
        log(envelope.page, envelope.posts);
        transform(envelope.posts);

        $scope.$apply(function() {
            Array.prototype.push.apply(posts.items, envelope.posts);
            $scope.disableAutoload = envelope.posts.length == 0;
            $scope.loading = false;
        });
    });

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
            page: $scope.page,
            disableAutoload: $scope.disableAutoload,
            lastVisitedPost: post.id
        });
    };

    $scope.loadSaved = function(){
        var state = router.loadState();
        if(state) {
            $scope.page = state.page;
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
    };

    $scope.postUrl = function() {
        if (!$scope.url || $scope.url.length < 10) {
            $scope.postUrlNotice = 'Сначала нужно ставить ссылку';
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
            $scope.postUrlNotice = 'Ссылка скоро появится в списке';
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
