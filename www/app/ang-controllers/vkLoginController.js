angular.module("angControllers").controller("vkLoginController", [
    'user', '$scope', '$http', '$timeout', 'vk', '$stateParams',
    function(user, $scope, $http, $timeout, vk, $stateParams) {
        var accessToken = $stateParams.access_token;
        var userId = $stateParams.user_id;
        if (accessToken && userId) {
            vk.auth(accessToken, userId)
            .then(function() {
                vk.getUser()
                .then(function(res) {
                    log(res);
                });
            });
        }    
}]);