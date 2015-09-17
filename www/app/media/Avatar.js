(function(){
services
    .factory('Avatar',
    ['apiRequest', '$q', '$upload', 'api', '$rootScope', 
    function(apiRequest, $q, $upload, api, $rootScope) {

            function Avatar(dataFromServer, dataFromStorage) {
                var parsed =  dataFromStorage ?
                    dataFromStorage : 
                    parseDataFromServer(dataFromServer);
                this.url = parsed.url;
                this.urlMini = parsed.urlMini;
            }
 
            //if no data is provided, random avatar will be set
            function parseDataFromServer(dataFromServer) {
                var output = {
                    fullSize: null,
                    mini: null, 
                };

                if (dataFromServer) {
                    if (dataFromServer.avatar_url) {
                        output.url = dataFromServer.avatar_url;
                        output.urlMini =  dataFromServer.avatar_url.replace(/(upload\/)([a-z0-9]*)(\/)/, '$1' + 'w_80/$2' + '$3');
                    }
                    else if (dataFromServer.avatar_guid) {
                        output.url = config('adorableUrl') + '/' + dataFromServer.avatar_guid;
                        output.urlMini = config('adorableUrl') + '/40/' + dataFromServer.avatar_guid;
                    }
                    else if (dataFromServer.uuid) {
                        output.url = config('adorableUrl') + '/' + dataFromServer.uuid;
                        output.urlMini = config('adorableUrl') + '/40/' + dataFromServer.uuid;
                    }
                }
                else {
                    output.url = config('adorableUrl') + '/' + Math.round(Math.random() * 1000);
                    output.urlMini = config('adorableUrl') + '/40/' + Math.round(Math.random() * 1000);
                }

                return output;
            }

            Avatar.parseFromStorage = function(dataFromStorage) {
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
                    return apiRequest.send(
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
                    return apiRequest.send(
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
                    var d = $q.defer();
                    fileTypeDeterminer.detect(file, 
                        function(type) {
                            $upload.upload({
                                method: 'POST',
                                url: config('apiUrl') + "/avatar",
                                headers: {
                                    "Authorization": "Token token=" + api.accessToken
                                },
                                file: file,
                                fileName: "image." + type,
                                fileFormDataName: "avatar[data]"
                            })
                            .then(
                                function(res) {
                                    $rootScope.$broadcast('user avatar was updated');
                                    d.resolve();
                                },
                                function(res) {
                                    d.reject();
                                }
                            );
                        },
                        function() {
                            alert("пожалуйста, выберете изображение");
                            d.reject();
                        }
                    );
                    return d.promise;  
                },
            };

            return Avatar;
        }
    ]);
})();