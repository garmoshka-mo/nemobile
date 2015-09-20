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

}]);
})();