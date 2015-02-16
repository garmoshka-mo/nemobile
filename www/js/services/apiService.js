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
                    return $q.reject({errorDescription: res.data.error[1]});
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
                    return $q.reject({errorDescription: res.data.error});
                }
            });
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
            });
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
            );
        },

        getTimeDifference: function() {
            return api.getServerTime()
            .then(function(time) {
                var deviceServerTimeDifference_msec = time * 1000 - new Date().getTime();
                console.log("Difference with server time(msec): ", deviceServerTimeDifference_msec);
                return deviceServerTimeDifference_msec;
            });
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
            });
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
                    return $q.reject();
                }
            );
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
            );
        },

        addNewCategory: function(name) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + "/categories",
                data: {
                    "access_token": api.accessToken,
                    "category": {"name": name}
                }
            });
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
            );
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
            );
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
            );
        },
        addStickerFile: function(categoryId, file) {
            var d = $q.defer();
            fileTypeDeterminer.detect(file, 
                function(type) {

                    $upload.upload({
                        method: 'POST',
                        url: App.Settings.apiUrl + "/categories/" + categoryId + "/images",
                        data: {
                            "access_token": api.accessToken,
                            "id": categoryId,
                        },
                        file: file,
                        fileName: "image." + type,
                        fileFormDataName: "image[image_data]"
                    })
                    .then(
                        function(res) {
                            d.resolve();
                        },
                        function(res) {
                            d.reject();
                        }
                    );
                },
                function() {
                    alert("wrong file type");
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
            );
        },

        removeSticker: function(categoryId, imageId) {
            var url = App.Settings.apiUrl + "/categories/" + categoryId + "/images" + "/" + imageId
                        + "?access_token=" + api.accessToken;
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
            );
        },

        initPhoneActivation: function(phoneNumber) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + "/phone/activation/init",
                data: {
                    "phone_number": phoneNumber,
                }
            })
            .then(
                function(res) {
                    console.log(res);
                    if (!res.data.success) {
                        return $q.reject();
                    }
                },
                function(res) {
                    console.log(res);
                    return $q.reject();
                }
            );
        },

        confirmPhoneNumber: function(phoneNumber, activationCode, sendAccessToken) {
            var data = {
                "phone_number": phoneNumber,
                "activation_code": activationCode
            };

            if (sendAccessToken) {
                data["access_token"] = api.accessToken;
            }

            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + "/phone/activation/confirm",
                data: data
            })
            .then(
                function(res) {
                    console.log(res.data);
                    if (res.data.success) {
                        return res.data;
                    }
                    else {
                        return $q.reject();
                    }
                },
                function(res) {
                    console.log(res);
                    return $q.reject();
                }
            );
        },

        attachPhoneNumber: function(phoneNumber) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + "/phone/activation/attach",
                data: {
                    "phone_number": phoneNumber,
                    "access_token": api.accessToken
                }
            })
            .then(
                function(res) {
                    if (res.data.success) {
                        return res.data;
                    }
                    else {
                        return $q.reject(res.data.error);
                    }
                },
                function(res) {
                    console.log(res);
                    return $q.reject();
                }
            );
        },

        findNepotomUsers: function(phoneNumbersArr) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + "/users/phonebook_search",
                data: {
                    "phonebook": phoneNumbersArr,
                    "access_token": api.accessToken
                }
            })
            .then(
                function(res) {
                    if (res.data.success) {
                        return res.data;
                    }
                    else {
                        return $q.reject(res.data.error);
                    }
                },
                function(res) {
                    console.log(res);
                    return $q.reject();
                }
            );
        },

        getUserInfoByUuid: function(uuid) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + "/users",
                data: {
                    "user_uuid": uuid,
                    "access_token": api.accessToken
                }
            })
            .then(
                function(res) {
                    console.log(res);
                    if (res.data.success) {
                        return res.data;
                    }
                    else {
                        return $q.reject(res.data.error);
                    }
                },
                function(res) {
                    console.log(res);
                    return $q.reject();
                }
            );
        }
    };


    //for testing
    window.api = api;

    return api;
}]);
