(function() {
    angular.module("angServices")
        .service('posts',
        ['apiRequest',
function(apiRequest) {

    var self = this;

    this.getPostsList = function(page) {
        return apiRequest.send('GET', '/posts/list/' + page);
    };

    this.getPost = function(postId) {
        return apiRequest.send('GET', '/posts/' + postId);
    };

    this.publishPost = function(chat) {
        return apiRequest.send('POST', '/posts', chat).then(function (data) {
            self.lastPublishedPost = data;
        });
    };

    this.getLastPublishedPost = function() {
        return self.lastPublishedPost;
    }
}]);
})();