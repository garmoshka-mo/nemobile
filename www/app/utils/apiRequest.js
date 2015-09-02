(function(){

services
    .factory('apiRequest',
    ['$http',
function ($http) {

    function Config(method, url, data, withoutAccessToken) {
        this.method = method;

        var host = (localStorage['apiUrl'] && localStorage['apiUrl'].length > 0) ?
            localStorage['apiUrl'] : config('apiUrl');
        this.url = host + url;
        if (data) {
            this.data = data;
        }
        if (!withoutAccessToken) {
            this.headers= {
                "Authorization": "Token token=" + api.accessToken
            };
        }
    }

    return {
        send: function(method, url, data, withoutAccessToken) {
            return $http(new Config(method, url, data, withoutAccessToken));
        }
    };
    
}]);
}

)();