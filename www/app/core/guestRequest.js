(function(){

angular.module("angServices")
    .service('guestRequest',
    ['$http', '$q',
function ($http, $q) {

    var host = config('apiUrl');

    function Config(method, url, data) {
        this.method = method;
        this.url = host + url;
        if (data) this.data = data;
    }

    function handle200Response(res) {
        if (res.data.success)
            return res.data;
        else
            return $q.reject(res.data.error);
    }

    function handleFailure() {
        return $q.reject();
    }

    return {
        send: function(method, url, data) {
            return $http(new Config(method, url, data))
            .then(handle200Response, handleFailure);
        }
    };
    
}]);
}

)();