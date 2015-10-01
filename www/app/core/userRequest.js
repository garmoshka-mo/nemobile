(function(){

angular.module("angServices")
    .service('userRequest',
    ['$http', '$q',
function ($http, $q) {

    var host = config('apiUrl');

    function Config(method, url, data, sync) {
        this.method = method;
        this.url = host + url;
        if (data) this.data = data;
        this.headers= { "Authorization": "Token token=" + user.accessToken };
        if (sync) this.async = false;
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

        sendForSure: function(method, url, data) {
            return user.ensure().then(function(){
                return $http(new Config(method, url, data))
                    .then(handle200Response, handleFailure);
            });
        },

        sendSync: function(method, url, data) {
            return $.ajax(new Config(method, url, data, true));
        }
    };
    
}]);
}

)();