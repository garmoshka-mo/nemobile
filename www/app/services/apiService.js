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

        addVirtualAccount: function() {
            return (apiRequest.send(
                'POST',
                '/add_virtual_user'
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
