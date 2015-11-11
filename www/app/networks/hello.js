angular.module("angServices")
    .service('hello', ['api', '$rootScope', '$q', '$http', function(api, $rootScope, $q, $http) {

        hello.init({
            twitter: '7mdDYK2MmmvxB8WA29wetafqK',
            instagram: 'b7e9112f9f2246fabe833c98666b4d13'
        }, {
            redirect_uri: 'redirect.html'
            //redirect_uri:'https://www.google.com'
        });

        hello.on('auth.login', function() {

        });

        this.login = function(network) {
            return hello(network).login();
        };

        this.me = function(network) {
            return hello(network).api('/me');
        }
}]);