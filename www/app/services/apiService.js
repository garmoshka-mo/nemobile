services
.factory('api', ['$http', '$q', '$upload', 'apiRequest',
    function ($http, $q, $upload, apiRequest) {
    
    log("api service is enabled");
        
    var api = {
        
        setAccessToken: function(accessToken) {
            this.accessToken = accessToken;
        },

        clearAccessToken: function() {
            this.accessToken = null;
        },



        signin: function(name, password) {
            return (apiRequest.guestSend(
                'POST',
                '/login',
                {name: name, password: password}
            ));
        },

        signup: function(name, password) {
            return (apiRequest.guestSend(
                'POST',
                '/register',
                {name: name, password: password}
            ));
        },

        getUserInfo: function(access_token) {
            return (apiRequest.send(
                'POST',
                '/profile'
            ));
        },

        updateProfile: function(name, password) {
            var data = {};
            if (name) {
                data.name = name;
            }

            if (password) {
                data.password = password;
            }

            return (apiRequest.send(
                'PUT',
                '/profile',
                data
            ));
        },

        getServerTime: function() {
            return (apiRequest.send(
                'GET',
                '/time'
            ));
        },

        getTimeDifference: function() {
            return api.getServerTime()
            .then(function(res) {
                var time = res.origin_time;
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
            return (apiRequest.send(
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

            return (apiRequest.send(
                'POST',
                '/users/search',
                {
                    "search_params": searchParams
                }
            ));
        },

        getCategories: function() {
            return (apiRequest.send(
                'GET',
                '/categories'
            ));
        },

        addNewCategory: function(name) {
            return (apiRequest.send(
                'POST',
                '/categories',
                {
                    "category": {"name": name}
                }
            ));
        },

        removeCategory: function(categoryId) {
            return (apiRequest.send(
                'DELETE',
                '/categories/' + categoryId
            ));
        },

        updateCategory: function(categoryId, name, associatedWords) {
            var categoryData = {};
            if (name) {
                categoryData.name = name;
            }

            if (associatedWords) {
                categoryData.associated_words = associatedWords;
            }

            return (apiRequest.send(
                'PUT',
                '/categories/' + categoryId,
                {
                    "category": categoryData
                }
            ));
            
        },

        addStickerURL: function(categoryId, imageURL) {
            return (apiRequest.send(
                'POST',
                '/categories/' + categoryId + '/images',
                {
                    "id": categoryId,
                    "image": {"image_url": imageURL}
                }
            ));
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
            return (apiRequest.send(
                'PUT',
                url,
                {
                    "id": categoryId,
                    "image_id": imageId,
                    "new_category_id": newCategoryId
                }
            ));
        },

        removeSticker: function(categoryId, imageId) {
            var url = config('apiUrl') + "/categories/" + categoryId + "/images" + "/" + imageId;
                        
            return (apiRequest.send(
                'DELETE',
                url
            ));
        },

        initPhoneActivation: function(phoneNumber) {
            // todo: redo to send with token
            return (apiRequest.guestSend(
                'POST',
                '/phone_number/initialize_authentication',
                {
                    "phone_number": phoneNumber
                }
            ));
        },

        confirmPhoneNumber: function(phoneNumber, activationCode, sendAccessToken) {
            var data = {
                "phone_number": phoneNumber,
                "activation_code": activationCode
            };

            // todo: send always with token
            var withoutAccessToken = true;
            if (sendAccessToken) {
                withoutAccessToken = false;
            }

            return (apiRequest.send(
                'POST',
                '/phone_number/confirm',
                data
            ));
        },

        attachPhoneNumber: function(phoneNumber) {
            return (apiRequest.send(
                'POST',
                '/phone/activation/attach',
                {
                    "phone_number": phoneNumber
                }
            ));
            
        },

        findNepotomUsers: function(phoneNumbersArr) {
            return (apiRequest.send(
                'POST',
                '/users/phonebook_search',
                {
                    "phonebook": phoneNumbersArr
                }
            ));
        },

        getUserInfoByUuid: function(uuid) {
            return (apiRequest.send(
                'POST',
                '/users',
                {
                    "user_uuid": uuid
                }
            ));
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
            return (apiRequest.send(
                'POST',
                '/avatar',
                avatarData
            ));
        },

        addVirtualAccount: function() {
            return (apiRequest.send(
                'POST',
                '/add_virtual_user'
            ));
        },

        blockUser: function(uuid) {
            return (apiRequest.send(
                'POST',
                '/users/blacklist',
                {
                    "user_uuid": uuid
                }
            ));
        },

        forbidImage: function(imageId) {
            return (apiRequest.send(
                'POST',
                '/image/abuse',
                {
                    "image_id": imageId,
                }
            ));
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
                return (apiRequest.send(
                    'PATCH',
                    '/set_friends',
                    {
                        "friends": friendsArray
                    }

                ));
            }
        },

        getFriends: function() {
            return (apiRequest.send(
                'GET',
                '/get_friends'
            ));
        },

        removeFriend: function(uuids) {
            return (apiRequest.send(
                'PATCH',
                '/delete_friends',
                {
                    "uuids": uuids
                }           
            ));
        },

        socialSignin: function(provider, providerId, providerToken) {
            
            return (apiRequest.send(
                'POST',
                '/providers',
                {
                    "provider": provider,
                    "provider_user_id": providerId,
                    "provider_token": providerToken
                }
            ));
            
        },

        randomChatRequest: function(data) {
            log(data);

            return (apiRequest.send(
                'POST',
                '/random',
                data
            ));
        },

        cancelRandomRequest: function() {
            return (apiRequest.send('DELETE', '/random'));
        },

        deleteChat: function(channel) {
            return (apiRequest.send(
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
