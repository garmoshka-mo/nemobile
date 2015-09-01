(function(){

services
    .factory('apiFactory',
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

    var api = {

        setAccessToken: function(accessToken) {
            this.accessToken = accessToken;
        },

        clearAccessToken: function() {
            this.accessToken = null;
        }
    };

    return api;
    
}]);
}

)();