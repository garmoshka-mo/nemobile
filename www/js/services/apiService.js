services
.factory('api', ['$http', '$q', '$upload', 'notification','storage', '$rootScope',
    function ($http, $q, $upload, user, notification, storage, $rootScope) {
    
    console.log("api service is enabled");
    
    var api = {
        
        setAccessToken: function(accessToken) {
            this.accessToken = accessToken;
        },

        clearAccessToken: function() {
            this.accessToken = null;
        },

        signin: function(name, password) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + '/login',
                data: {name: name, password: password}
            })
            .then(function(res) {
                if (res.data.success) {
                    return {accessToken: res.data.access_token};
                }
                else {
                    return $q.reject({errorDescription: res.data.error[1]})
                }
            });
        },

        signup: function(name, password) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + '/register',
                data: {name: name, password: password}
            })
            .then(function(res) {
                console.log(res);
                if (res.data.success) {
                    return true;
                }
                else {
                    return $q.reject({errorDescription: res.data.error})
                }
            })
        },

        getUserInfo: function(access_token) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + '/profile',
                data: {access_token: access_token}
            })
            .then(function(res) {
                if (res.data.success) {
                    return res.data.user;
                }
                else {
                    return $q.reject();
                }
            })
        },

        getServerTime: function() {
            return $http({
                method: 'GET',
                url: App.Settings.apiUrl + '//time?access_token=' + api.accessToken ,
            })
            .then(
                function(res) {
                    return res.data.origin_time;
                },
                function(res) {
                    return $q.reject();
                }
            )
        },

        getTimeDifference: function() {
            return api.getServerTime()
            .then(function(time) {
                var deviceServerTimeDifference_msec = time * 1000 - new Date().getTime();
                console.log("Difference with server time(msec): ", deviceServerTimeDifference_msec);
                return deviceServerTimeDifference_msec;
            })
        },

        sendMessage: function(messageText, recepientId, ttl) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + '/messages',
                data: {
                    "access_token": api.accessToken,
                    "recepient_uuid": recepientId,
                    "message_text": messageText,
                    "ttl": ttl
                }
            })
        },

        searchUser: function(userName) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + '/users/search',
                data: {
                    "access_token": api.accessToken,
                    "search_params": [{name: userName}]
                }
            })
            .then(
                function(res) {
                    if (res.data.success) {
                        return res.data;
                    }
                    else {
                        return $q.reject();
                    }
                },
                function(res) {
                    return $q.reject();;
                }
            )
        },

        getCategories: function() {
            return $http({
                method: 'GET',
                url: App.Settings.apiUrl + "/categories?access_token=" + api.accessToken ,
            })
            .then(
                function(res) {
                    return res.data.categories;
                },
                function(res) {
                    return $q.reject();
                }
            )
        },

        addNewCategory: function(name) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + "/categories",
                data: {
                    "access_token": api.accessToken,
                    "category": {"name": name}
                }
            })
        },

        removeCategory: function(categoryId) {
            return $http({
                method: 'DELETE',
                url: App.Settings.apiUrl + "/categories/" + categoryId + "?access_token=" + api.accessToken,
            })
            .then(
                function(res) {
                    console.log(res);
                    return res.data.categories;
                },
                function(res) {
                    return $q.reject();
                }
            )
        },

        updateCategory: function(categoryId, name) {
            return $http({
                method: 'PUT',
                url: App.Settings.apiUrl + "/categories/" + categoryId,
                data: {
                    "access_token": api.accessToken,
                    "category": {"name": name}
                }
            })
            .then(
                function(res) {
                    console.log(res);
                },
                function(res) {
                    return $q.reject();
                }
            )
        },

        addStickerURL: function(categoryId, imageURL) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + "/categories/" + categoryId + "/images",
                data: {
                    "access_token": api.accessToken,
                    "id": categoryId,
                    "image": {"image_url": imageURL}
                }
            })
            .then(
                function(res) {
                    console.log(res);
                    return res.data.categories;
                },
                function(res) {
                    return $q.reject();
                }
            )
        },

        addStickerFile: function(categoryId, fileURL) {
            var d = $q.defer();
            

            var params = {};
            params.access_token = api.accessToken;
            params.id = categoryId;


            window.resolveLocalFileSystemURL(fileURL, 
                function( fileEntry){
                    var options = new FileUploadOptions();
                    options.params = params;
                    options.fileKey = "image[image_data]";
                    options.fileName = fileEntry.nativeURL.substr(fileEntry.nativeURL.lastIndexOf('/') + 1);
                    var buf = options.fileName.split(".");
                    var extenstion = buf[buf.length - 1];
                    options.mimeType = "image/" + extenstion;

                    var ft = new FileTransfer();
                    ft.upload(
                        fileURL, 
                        encodeURI(App.Settings.apiUrl + "/categories/" + categoryId + "/images"),
                        success,
                        error,
                        options
                    );

                    function success(result) {
                        d.resolve()
                        console.log("result:", result)
                    }

                    function error(result) {
                        console.error("upload is failed")
                        d.reject();
                    }
                },
                function(){
                    console.error("upload is failed")
                }
            );
        return d.promise;
        },

        moveSticker: function(categoryId, imageId, newCategoryId) {
            var url = App.Settings.apiUrl + "/categories/" + categoryId + "/images/" + imageId;
            return $http({
                method: 'PUT',
                url: url,
                data: {
                    "access_token": api.accessToken,
                    "id": categoryId,
                    "image_id": imageId,
                    "new_category_id": newCategoryId
                }
            })
            .then(
                function(res) {
                    console.log(res);
                },
                function(res) {
                    return $q.reject();
                }
            )
        },

        removeSticker: function(categoryId, imageId) {
            var url = App.Settings.apiUrl + "/categories/" + categoryId + "/images" + "/" + imageId
                        + "?access_token=" + api.accessToken 
            return $http({
                method: 'DELETE',
                url: url
            })
            .then(
                function(res) {
                    console.log(res);
                    return res.data.categories;
                },
                function(res) {
                    return $q.reject();
                }
            )
        }
    }


    //for debugging purpose
    window.api = api;

    return api;
}])
