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

    this.publishPost = function(data) {
        return apiRequest.send('POST', '/posts', data);
    };

    function ratePost(postId, score) {
        return apiRequest.send('POST', '/posts/' + postId + '/rate', { score: score });
    }

    this.likePost = function(postId) {
        return ratePost(postId, +1);
    };

    this.dislikePost = function(postId) {
        return ratePost(postId, -1);
    };
}]);
})();