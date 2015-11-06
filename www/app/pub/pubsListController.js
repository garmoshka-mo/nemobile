angular.module("angControllers")
.controller("pubsListController", [
    '$scope', 'posts', 'router', '$anchorScroll', '$location',
        '$timeout', '$rootScope', 'googleAnalytics',
function($scope, posts, router, $anchorScroll, $location,
         $timeout, $rootScope, googleAnalytics) {

    gfyCollection.get().length = 0;

    posts.currentPage = 1;
    posts.closeVideos();
    $scope.posts = posts;
    $scope.goto = router.goto;

    //disable control
    //$rootScope.mainFooterTemplate = 'app/pub/postsControl.html?'+version;

    $scope.loadMore = posts.loadMore;

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

    $scope.post = function() {
        if (!posts.text) {
            $scope.postNotice = 'Нельзя отправить пустую запись';
            return;
        }
        if (posts.text.length > 140) {
            $scope.postNotice = 'Лимит записи - 140 символов';
            return;
        }

        $scope.publishing = true;
        posts.post(posts.text).then(function (data) {
            $scope.publishing = false;
            posts.text = '';
            $scope.postNotice = 'Успешно';
        });
    };

    $scope.cutImage = function(post) {
        post.cutImage = true;
    };

    // todo: remove after fix of post directive:
    $scope.postVisibility = function(inview, post) {
        if (!inview && $rootScope.activePost == post)
            post = null;

        if ($rootScope.activePost != post) {
            $rootScope.activePost = post;
            posts.activePost = post;
        }
    };


    $scope.closeScoresAlert = function () {
        $('#few-scores-alert').foundation('reveal', 'close');
    };    
    $scope.addPost = function () {
        googleAnalytics.event('public', 'addPost');
        //$('#few-scores-alert').foundation('reveal', 'open');
        $scope.canAddPost = true;
    };

    // Заготовка для "многоканальной" ленты
    var $mainSection = $('#main-section');
    $mainSection.scroll(function () {
        //console.log();
        //$mainSection.scrollTop();
        // Следить за появляющимися внизу айтемами,
        // и разделять его на два цвета
        //$(window).height() - $('#ee').position().top
    });

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

app.directive('post', ['$rootScope', 'posts', '$sce', 'router','$location', function($rootScope, posts, $sce, router) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            model: "="
        },
        link: function(scope, elem, attr) {
            $rootScope.activePost = null;
            scope.postVisibility = function(inview, post) {
                console.log('visi', post);
                if (!inview && $rootScope.activePost == post)
                    post = null;

                if ($rootScope.activePost != post) {
                    $rootScope.activePost = post;
                    posts.activePost = post;

                    if (post && post.category == 'gfy') {
                        gfyCollection.pauseAll();
                        gfyCollection.play(post.gfy);
                    }
                }
            };
            scope.activatePost = function(post) {
                if (post.data.link.embed_url) {
                    post.videoUrl = $sce.trustAsResourceUrl(post.data.link.embed_url);
                    post.showVideo = true;
                }
                else {
                    router.openExternalURL('/pub/' + post.id + '/view')
            }
            };
            scope.cutImage = function(post) {
                post.cutImage = true;
            };
        },
        templateUrl: "app/pub/post.html?"+version
    };
}]);
