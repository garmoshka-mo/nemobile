angular.module("angServices", []).factory('api', ['$http', function ($http) {
    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

    function toParams (obj) {
        var p = [];
        for (var key in obj) {
            p.push(key + '=' + obj[key]);
        }
        return p.join('&');
    };

    return {
        signin: function(name, password) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + '/login',
                data: toParams({name: name, password: password})
            });
        },

        signup: function(name, password) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + '/register',
                data: toParams({name: name, password: password})
            });
        }
    }
}])
