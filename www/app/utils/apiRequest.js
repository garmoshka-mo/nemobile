(function(){

services
    .service('apiRequest',
    ['$http',
function ($http) {

    function Config(method, url, data, withoutAccessToken, sync) {
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

        if (sync) {
            this.async = false;
        }
    }

    return {
        send: function(method, url, data) {
            return $http(new Config(method, url, data));
        },

        guestSend: function(method, url, data) {
            return $http(new Config(method, url, data, true));
        },

        sendSync: function(method, url, data) {
            return $.ajax(new Config(method, url, data, false, true));
        }
    };
    
}]);
}

)();