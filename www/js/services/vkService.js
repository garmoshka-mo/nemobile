services
.service('vk', ['api', '$rootScope', '$q', '$http', function(api, $rootScope, $q, $http) {
    var vkUserId = null;
    var vkToken = null;

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
    this.auth = function (accessToken, id) {
        var d = $q.defer();
        
        if (accessToken && id) {
            vkUserId = id;
            vkToken = accessToken;
            d.resolve();
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
        var methodName = 'users.get';
        var params = {
            user_id: vkUserId,
        };
        return callMethod(methodName, params);
    };

    this.getUserAvatar = function() {

    };
    
}]);