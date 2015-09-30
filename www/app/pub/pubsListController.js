angular.module("angControllers")
.controller("pubsListController", [
    '$scope', 'posts', 'router', '$anchorScroll', '$location', '$timeout', 'socket',
function($scope, posts, router, $anchorScroll, $location, $timeout, socket) {

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
    };




    $scope.postUrl = function() {
        $scope.publishing = true;
        var data = {
            title: $scope.title || Date.now().toDateTime(),
            link: {
                url: $scope.url
            }
        };
        posts.publishPost(data).then(function (data) {
            $scope.publishing = false;
            //router.goto('publishSuccess', {postId: data.safe_id, channel: $stateParams.channel});
        });

    };


    var DynamicItems = function() {
        var self = this;
        this.loadedPages = {};
        this.numItems = 12;
        this.PAGE_SIZE = 3;

        socket.on('posts', function(envelope) {
            var pageNumber = envelope.page;
            console.log(pageNumber, envelope.posts);
            $scope.$apply(function() {
                self.loadedPages[pageNumber] = envelope.posts;
            });
        });
    };
    // Required.
    DynamicItems.prototype.getItemAtIndex = function(index) {
        var pageNumber = Math.floor(index / this.PAGE_SIZE);
        var page = this.loadedPages[pageNumber];
        if (page) {
            return page[index % this.PAGE_SIZE];
        } else if (page !== null) {
            this.fetchPage_(pageNumber);
            return null;
        }
    };
    // Required.
    DynamicItems.prototype.getLength = function() {
        return this.numItems;
    };
    DynamicItems.prototype.fetchPage_ = function(pageNumber) {
        // Set the page to null so we know it is already being fetched.
        this.loadedPages[pageNumber] = null;
        socket.emit('posts', {get: 'random items', page: pageNumber});

        if ((pageNumber + 3) * this.PAGE_SIZE > this.numItems)
            this.numItems += this.PAGE_SIZE;
    };
    $scope.dynamicItems = new DynamicItems();

}
]);
