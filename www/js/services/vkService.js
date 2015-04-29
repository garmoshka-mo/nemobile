services
.service('vk', ['api', '$rootScope', '$q', '$http', function(api, $rootScope, $q, $http) {
    var vkUserId = null;
    var vkToken = null;
    var isWeb = window.device ? false : true;

    var url_parser={
        get_args: function (s) {
            var tmp = new Array();
            s = (s.toString()).split('&');
            for (var i in s) {
                i = s[i].split("=");
                tmp[(i[0])] = i[1];
            }
            return tmp;
        },
        get_args_cookie: function (s) {
            var tmp = new Array();
            s = (s.toString()).split('; ');
            for (var i in s) {
                i=s[i].split("=");
                tmp[(i[0])]=i[1];
            }
            return tmp;     
        }
    }; 

    function authEventUrl(event) {
        // alert('loading stopped');
        var tmp = (event.url).split("#");
        if (tmp[0]=='https://oauth.vk.com/blank.html' || tmp[0]=='http://oauth.vk.com/blank.html') {
            console.log(tmp);
            wwwref.close();
            tmp = url_parser.get_args(tmp[1]);
            if (tmp['error']) {
                return  false;
            }
            vkUserId = tmp['user_id'];
            vkToken = tmp['access_token'];
            return true;
        }
    }

    function paramsToString(paramsObj) {
        var output = [];
        for (var key in paramsObj) {
            output.push(key + "=" + paramsObj[key]);
        }
        return output.join('&');
    }

    function callMethod(method, params) {
        var url = "https://api.vk.com/method/" + method + 
        "?" + paramsToString(params) + "&v=5.30&access_token=" + vkToken;
        console.log('callMethod', url);
        return $http.get(encodeURI(url));
    } 
    
    var wwwref = null;
    var pluginPerms = "friends,wall,photos,messages,wall,offline,notes";
        
    //public methods 
    this.auth = function () {
        var d = $q.defer();
        
        function authInfo(response) {
            vkUserId = response.session.mid;
            d.resolve();
        }

        if (isWeb) {
            VK.Auth.login(authInfo);
        }
        else {
            var authURL="https://oauth.vk.com/authorize?client_id=4889771&scope=" + 
                pluginPerms + 
                "&redirect_uri=http://oauth.vk.com/blank.html&display=touch&response_type=token";
                wwwref = window.open(encodeURI(authURL), '_blank', 'location=no');
                wwwref.addEventListener('loadstop', 
                function(event) {
                    if(authEventUrl(event)) {
                        d.resolve();
                    }
                    else {
                        console.error('vk auth failed');
                        d.reject();
                    }
                }
            );
        }
        
        return d.promise;
    };

    this.getUser = function() {
        var fields = "photo_100, photo_max_orig";
        if (isWeb) {
            var d = $q.defer();
            VK.Api.call('users.get', {uids: vkUserId, fields: fields}, function(res) {
                d.resolve(res.response[0]);
            });
            return d.promise;
        }
        else {
            var methodName = 'users.get';
            var params = {
                user_id: vkUserId,
                fields: fields
            };
            return callMethod(methodName, params)
            .then(function(res) {
                return res.data.response[0];
            });
        }
    };

}]);