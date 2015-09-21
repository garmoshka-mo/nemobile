(function(){

angular.module("angServices")
    .service('apiRequest',
    ['$http', '$q',
function ($http, $q) {

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

    function handle200Response(res) {
        if (res.data.success)
            return res.data;
        else {
            if (res.data.error == 'invalid_token') user.logoutAndGoHome();
            return $q.reject(res.data.error);
        }
    }

    function handleFailure() {
        return $q.reject();
    }

    return {
        send: function(method, url, data) {
            return $http(new Config(method, url, data))
            .then(handle200Response, handleFailure);
        },

        guestSend: function(method, url, data) {
            return $http(new Config(method, url, data, true))
            .then(handle200Response, handleFailure);
        },

        sendSync: function(method, url, data) {
            return $.ajax(new Config(method, url, data, false, true));
        }
    };
    
}]);
}

)();