services
.factory('api', ['$http', '$q', '$upload', 'notification','storage', '$rootScope',
    function ($http, $q, $upload, user, notification, storage, $rootScope) {
    
    log("api service is enabled");

    function Config(method, url, data, withoutAccessToken) {
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
    }
    
    var api = {
        
        setAccessToken: function(accessToken) {
            this.accessToken = accessToken;
        },

        clearAccessToken: function() {
            this.accessToken = null;
        },



        signin: function(name, password) {
            return $http(new Config(
                'POST',
                '/login',
                {name: name, password: password},
                true
            ))
            .then(function(res) {
                if (res.data.success) {
                    log('api.signin', res);
                    return {accessToken: res.data.access_token};
                }
                else {
                    return $q.reject({errorDescription: res.data.error[1]});
                }
            });
        },

        signup: function(name, password) {
            return $http(new Config(
                'POST',
                '/register',
                {name: name, password: password},
                true
            ))
            .then(function(res) {
                // log('api.signup', res);
                if (res.data.success) {
                    return true;
                }
                else {
                    return $q.reject({errorDescription: res.data.error});
                }
            });
        },

        getUserInfo: function(access_token) {
            return $http(new Config(
                'POST',
                '/profile'
            ))
            .then(function(res) {
                log('api.getUserInfo', res);
                if (res.data.success) {
                    return res.data.user;
                }
                else {
                    return $q.reject();
                }
            });
        },

        updateProfile: function(name, password) {
            if (name) {
                data.name = name;
            }

            if (password) {
                data.password = password;
            }

            return $http(new Config(
                'PUT',
                '/profile',
                data
            ))
            .then(
                function(res) {
                    log('update profile', res);
                    if (res.data.success) {
                        return res.data;
                    }
                    else {
                        return $q.reject(res.data.error);
                    }
                },
                function(res) {
                    console.error(res);
                }
            );
        },

        getServerTime: function() {
            return $http(new Config(
                'GET',
                '/time'
            ))
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
                log("Difference with server time(msec): ", deviceServerTimeDifference_msec);
                return deviceServerTimeDifference_msec;
            });
        },

        sendMessage: function(messageText, address, ttl) {
            var data = {
                "message_text": messageText,
                "ttl": ttl
            };

            if (address.channel) {
                data.channel = address.channel;
            }
            else if (address.uuid) {
                data.recipient_uuid = address.uuid;
            }
            else {
                console.error("there's no recipient address");
                return;
            }
            return $http(new Config(
                'POST',
                '/messages',
                data
            ));
        },

        searchUser: function(userName, userPhone) {
            var searchParams;
            if (userPhone) {
                searchParams = [{"phone_number": userPhone}];
            }
            else {
                searchParams = [{"name": userName}];
            }

            return $http(new Config(
                'POST',
                '/users/search',
                {
                    "search_params": searchParams
                }
            ))
            .then(
                function(res) {
                    log(res);
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
            return $http(new Config(
                'GET',
                '/categories'
            ))
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
            return $http(new Config(
                'POST',
                '/categories',
                {
                    "category": {"name": name}
                }
            ));
        },

        removeCategory: function(categoryId) {
            return $http(new Config(
                'DELETE',
                '/categories/' + categoryId
            ))
            .then(
                function(res) {
                    log(res);
                    return res.data.categories;
                },
                function(res) {
                    return $q.reject();
                }
            );
        },

        updateCategory: function(categoryId, name, associatedWords) {
            var categoryData = {};
            if (name) {
                categoryData.name = name;
            }

            if (associatedWords) {
                categoryData.associated_words = associatedWords;
            }

            return $http(new Config(
                'PUT',
                '/categories/' + categoryId,
                {
                    "category": categoryData
                }
            ))
            .then(
                function(res) {
                    log(res);
                },
                function(res) {
                    return $q.reject();
                }
            );
        },

        addStickerURL: function(categoryId, imageURL) {
            return $http(new Config(
                'POST',
                '/categories/' + categoryId + '/images',
                {
                    "id": categoryId,
                    "image": {"image_url": imageURL}
                }
            ))
            .then(
                function(res) {
                    log(res);
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
                        url: config('apiUrl') + "/categories/" + categoryId + "/images",
                        data: {
                            "id": categoryId,
                        },
                        headers: {
                            "Authorization": "Token token=" + api.accessToken
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
            var url = config('apiUrl') + "/categories/" + categoryId + "/images/" + imageId;
            return $http(new Config(
                'PUT',
                url,
                {
                    "id": categoryId,
                    "image_id": imageId,
                    "new_category_id": newCategoryId
                }
            ))
            .then(
                function(res) {
                    log(res);
                },
                function(res) {
                    return $q.reject();
                }
            );
        },

        removeSticker: function(categoryId, imageId) {
            var url = config('apiUrl') + "/categories/" + categoryId + "/images" + "/" + imageId;
                        
            return $http(new Config(
                'DELETE',
                url
            ))
            .then(
                function(res) {
                    log(res);
                    return res.data.categories;
                },
                function(res) {
                    return $q.reject();
                }
            );
        },

        initPhoneActivation: function(phoneNumber) {
            return $http(new Config(
                'POST',
                '/phone_number/initialize_authentication',
                {
                    "phone_number": phoneNumber,
                },
                true
            ))
            .then(
                function(res) {
                    log(res);
                    if (!res.data.success) {
                        return $q.reject();
                    }
                },
                function(res) {
                    log(res);
                    return $q.reject();
                }
            );
        },

        confirmPhoneNumber: function(phoneNumber, activationCode, sendAccessToken) {
            var data = {
                "phone_number": phoneNumber,
                "activation_code": activationCode
            };

            var withoutAccessToken = true;
            if (sendAccessToken) {
                withoutAccessToken = false;
            }

            return $http(new Config(
                'POST',
                '/phone_number/confirm',
                data,
                withoutAccessToken
            ))
            .then(
                function(res) {
                    log(res.data);
                    if (res.data.success) {
                        return res.data;
                    }
                    else {
                        return $q.reject();
                    }
                },
                function(res) {
                    log(res);
                    return $q.reject();
                }
            );
        },

        attachPhoneNumber: function(phoneNumber) {
            return $http(new Config(
                'POST',
                '/phone/activation/attach',
                {
                    "phone_number": phoneNumber,
                }
            ))
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
                    log(res);
                    return $q.reject();
                }
            );
        },

        findNepotomUsers: function(phoneNumbersArr) {
            return $http(new Config(
                'POST',
                '/users/phonebook_search',
                {
                    "phonebook": phoneNumbersArr,
                }
            ))
            .then(
                function(res) {
                    // log('find nepotom users res', res.data);
                    if (res.data.success) {
                        return res.data;
                    }
                    else {
                        return $q.reject(res.data.error);
                    }
                },
                function(res) {
                    // log(res);
                    return $q.reject();
                }
            );
        },

        getUserInfoByUuid: function(uuid) {
            return $http(new Config(
                'POST',
                '/users',
                {
                    "user_uuid": uuid,
                }
            ))
            .then(
                function(res) {
                    // log('got user info by uuid', res);
                    if (res.data.success) {
                        return res.data;
                    }
                    else {
                        return $q.reject(res.data.error);
                    }
                },
                function(res) {
                    log(res);
                    return $q.reject();
                }
            );
        },

        //method to upload image as avatar
        updateAvatarFile: function(file) {
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

        //method to upload url or random string which are used to generate avatar
        updateAvatarText: function(avatarData) {
            $http(new Config(
                'POST',
                '/avatar',
                avatarData
            ));
        },

        addVirtualAccount: function() {
            return $http(new Config(
                'POST',
                '/add_virtual_user'
            ))
            .then(
                function(res) {
                    log("addVirtualAccount", res);
                    if (res.data.success) {
                        return res.data;
                    }
                    else {
                        console.error("add virtual account failed");
                        return $q.reject();
                    }
                },
                function(res) {
                    console.error("add virtual account failed");
                }
            );
        },

        blockUser: function(uuid) {
            return $http(new Config(
                'POST',
                '/users/blacklist',
                {
                    "user_uuid": uuid
                }
            ));
        },

        forbidImage: function(imageId) {
            return $http(new Config(
                'POST',
                '/image/abuse',
                {
                    "image_id": imageId,
                }
            ))
            .then(
                function(res) {
                    log(res);
                },
                function(res) {
                    log(res);
                }
            );        
        },

        setFriends: function(friendsArray) {
            //for testing purporses

            friendsArray = friendsArray ? friendsArray : [];
            friendsArray = friendsArray.map(function(friend) {
                return {
                    "uuid": friend.uuid,
                    "display_name": friend.displayName,
                    "created": friend.created.toString()
                };
            });
            // log('friendsArray', friendsArray);
            if (!_.isEmpty(friendsArray)) {
                return $http(new Config(
                    'PATCH',
                    '/set_friends',
                    {
                        "friends": friendsArray
                    }

                ));
            }
        },

        getFriends: function() {
            return $http(new Config(
                'GET',
                '/get_friends'
            ))
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
                    return $q.reject();
                }
            );
        },

        removeFriend: function(uuids) {
            return $http(new Config(
                'PATCH',
                '/delete_friends',
                {
                    "uuids": uuids
                }           
            ))
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
                    return $q.reject();
                }
            );
        },

        socialSignin: function(provider, providerId, providerToken) {
            
            return $http(new Config(
                'POST',
                '/providers',
                {
                    "provider": provider,
                    "provider_user_id": providerId,
                    "provider_token": providerToken
                }
            ))
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
                    log(res);
                    return $q.reject();
                }
            );
        },

        randomChatRequest: function(data) {
            log(data);

            return $http(new Config(
                'POST',
                '/random',
                data
            ))
            .then(
                function(res) {
                    log(res);
                    if (res.data.success) {

                    }
                    else {
                        return $q.reject();
                    }
                },
                function() {
                    return $q.reject();
                }
            );
        },

        cancelRandomRequest: function() {
            return $http(new Config(
                'DELETE',
                '/random'
            ));
        },

        deleteChat: function(channel) {
            return $http(new Config(
                'DELETE',
                '/chats/' + channel
            ))
            .then(function(res) {
                log(res);
            });
        }
    };


    //for testing
    window.api = api;

    return api;
}]);
