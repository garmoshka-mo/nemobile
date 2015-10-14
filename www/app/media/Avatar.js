(function(){
angular.module("angServices")
    .factory('Avatar',
    ['userRequest', '$q', 'Upload', 'api', '$rootScope',
    function(userRequest, $q, Upload, api, $rootScope) {

            function Avatar(dataFromServer, dataFromStorage) {
                this.update(dataFromServer, dataFromStorage);
            }
            
            function makeUrl(data) {
                return  config('adorableUrl') + '/' + data;
            }

            function makeUrlMini(data) {
                return config('adorableUrl') + '/40/' + data; 
            }

            //if no data is provided, random avatar will be set
            function parseDataFromServer(dataFromServer) {
                var output = {
                    fullSize: null,
                    mini: null
                };

                if (dataFromServer) {
                    if (dataFromServer.avatar_url) {
                        output.url = dataFromServer.avatar_url;
                        output.urlMini =  dataFromServer.avatar_url
                            .replace(/(upload\/)([a-z0-9]*)(\/)/, '$1' + 'w_80/$2' + '$3');
                    }
                    else if (dataFromServer.avatar_guid) {
                        output.url = makeUrl(dataFromServer.avatar_guid);
                        output.urlMini = makeUrlMini(dataFromServer.avatar_guid);
                    }
                    else if (dataFromServer.uuid) {
                        output.url = makeUrl(dataFromServer.uuid);
                        output.urlMini = makeUrlMini(dataFromServer.uuid);
                    }
                }
                else {
                    output.url = makeUrl(Math.round(Math.random() * 1000));
                    output.urlMini = makeUrlMini(Math.round(Math.random() * 1000));
                }

                return output;
            }

            Avatar.loadFromStorage = function(dataFromStorage) {
                return new Avatar(null, dataFromStorage);
            };

            Avatar.fromId = function(id) {
                return new Avatar({uuid: id});
            };

            Avatar.fromPhotos = function(photos) {
                var data = {
                    url: photos[0].value,
                    urlMini: photos[0].valueMini || photos[0].value
                };
                return new Avatar(null, data);
            };

            Avatar.prototype = {
                updateURL: function(url) {
                    return userRequest.send(
                        'POST',
                        '/avatar',
                        {url: url}
                    )
                    .then(
                        function() {
                            $rootScope.$broadcast('user avatar was updated');
                        },
                        function() {
                            log("updating avatar is failed");
                            return $q.reject();
                        }
                    );
                },

                updateGuid: function(guid) {
                    return userRequest.send(
                        'POST',
                        '/avatar',
                        {guid: guid}
                    )
                    .then(
                        function() {
                            $rootScope.$broadcast('user avatar was updated');
                        },
                        function() {
                            log("updating avatar is failed");
                            return $q.reject();
                        }
                    );
                },

                updateFile: function(file) {
                    return userRequest.sendFile(
                        'POST',
                        '/avatar',
                        {avatar: {data: file}}
                    )
                    .then(
                        function() {
                            $rootScope.$broadcast('user avatar was updated');
                        }
                    );
                   
                },
                update: function(dataFromServer, dataFromStorage) {
                    var parsed =  dataFromStorage ?
                        dataFromStorage :
                        parseDataFromServer(dataFromServer);
                    this.url = parsed.url;
                    this.urlMini = parsed.urlMini;
                }
            };

            return Avatar;
        }
    ]);
})();