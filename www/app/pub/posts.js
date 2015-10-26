(function() {
    angular.module("angServices")
        .service('posts',
        ['userRequest', 'socket', '$rootScope', 'language',
function(userRequest, socket, $rootScope, language) {

    var self = this;

    self.items = [];
    self.preview = {};

    self.currentPage = 1;
    self.disableAutoload = false;
    self.lastVisitedPost = null;

    this.getPostsList = function(page) {
        return userRequest.send('GET', '/posts/list/' + page);
    };

    this.loadMore = function() {
        if (self.loading) return;
        self.disableAutoload = true;
        self.loading = true;
        log('page of infinite scroll:', self.currentPage++);
        load();
    };

    function load() {
        socket.emit('posts', {get: 'random items', channel: language.current.key});
    }

    socket.on('posts', function(envelope) {
        log('received posts:', envelope.posts);
        transform(envelope.posts);

        $rootScope.$apply(function() {
            Array.prototype.push.apply(self.items, envelope.posts);
            self.disableAutoload = envelope.posts.length == 0;
            self.loading = false;
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

    this.getPost = function(postId) {
        return userRequest.send('GET', '/posts/' + postId);
    };

    this.publishPost = function(data) {
        return userRequest.sendForSure('POST', '/posts', data);
    };

    function ratePost(postId, score) {
        return userRequest.sendForSure('POST', '/posts/' + postId + '/rate/' + score);
    }

    this.likePost = function(postId) {
        return ratePost(postId, +1);
    };

    this.unlikePost = function(postId) {
        return ratePost(postId, 0);
    };

    this.deletePost = function(postId) {
        deletePostFromArray(postId);
        return ratePost(postId, -1);
    };

    this.closeVideos = function() {
        self.items.map(function (i) {
            i.showVideo = false;
            i.videoUrl = null;
        });
    };

    function deletePostFromArray(id) {
        self.items.map(function(p, i) {
            if (p.id == id) self.items.splice(i, 1);
        });
    }

}]);
})();