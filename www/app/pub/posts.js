(function() {
    angular.module("angServices")
        .service('posts',
        ['userRequest',
function(userRequest) {

    var self = this;

    self.items = [];
    self.preview = {};

    this.getPostsList = function(page) {
        return userRequest.send('GET', '/posts/list/' + page);
    };

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

    this.deletePost = function(postId) {
        deletePostFromArray(postId);
        return ratePost(postId, -1);
    };

    function deletePostFromArray(id) {
        self.items.map(function(p, i) {
            if (p.id == id) self.items.splice(i, 1);
        });
    }

}]);
})();