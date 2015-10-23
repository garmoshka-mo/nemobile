angular.module("angControllers")
.controller("pubsListController", [
    '$scope', 'posts', 'router', '$anchorScroll', '$location',
        '$timeout', 'socket', '$rootScope', 'vk', '$sce',
function($scope, posts, router, $anchorScroll, $location,
         $timeout, socket, $rootScope, vk, $sce) {

    posts.currentPage = 1;
    $scope.posts = posts.items;
    $scope.goto = router.goto;

    $rootScope.mainFooterTemplate = 'app/pub/postsControl.html?'+version;

    $scope.loadMore = function() {
        if($scope.skipSignIn || $scope.vkSignedIn) {
            if ($scope.loading) return;
            posts.disableAutoload = true;
            $scope.loading = true;
            log('page of infinite scroll:', posts.currentPage++);
            load();
            $scope.skipSignIn = false;
        } else {
            posts.disableAutoload = true;
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
    $scope.activatePost = function(post) {
        console.log(post);
        post.videoUrl =
            $sce.trustAsResourceUrl(post.data.link.embed_url);
        post.showVideo = true;
    };

    $scope.skipSignIn = true;
    vk.isAuthorised().then(function(isAuthorised) { $scope.vkSignedIn = isAuthorised; });

    $scope.signinVk = function() {
        vk.auth()
            .then(function(res) {
                user.socialSignin("vkontakte", res.vkUserId, res.vkAccessToken)
                    .then(
                    function() {
                        $scope.vkSignedIn = true;
                    }
                );
            });
    };

    $scope.skip = function () {
        $scope.skipSignIn = true;
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

app.directive('post', ['$rootScope', 'posts', function($rootScope, posts) {
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
                }
            };
            scope.cutImage = function(post) {
                post.cutImage = true;
            };
        },
        template: "<div ng-switch='model.category' in-view='postVisibility($inview, model)' in-view-options='{ offsetTop: 300, offsetBottom: -250 }'>" +
        "<div class='header'><div class='title'>{{ ::model.title }}</div></div>" +
        "<div ng-switch-when='link' class='image-container' ng-class='{\"cut-image\": model.cutImage}'>" +
        "<img ng-src='{{model.data.link.image_url}}' cut-image='cutImage(model)'>" +
        "</div>" +
        "<div ng-switch-default ng-transclude ng-class='{\"cut-image\": model.cutImage}' cut-image='cutImage(model)'></div>" +
        "<div class='cut' ng-show='model.cutImage'><div class='torn'><button ng-click='model.cutImage = false'>" +
        "<i class='fa fa-angle-double-down'></i> {{ 'pubs.expand' | translate }}" +
        "</button></div></div>" +
        "<div class='separator'></div>" +
        "</div>"
    };
}]);
