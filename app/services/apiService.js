angular.module("angServices")
.factory('api', ['$http', '$q', 'userRequest', 'guestRequest',
    function ($http, $q, userRequest, guestRequest) {
    
    log("api service is enabled");
        
    var api = {
        
        searchUser: function(userName, userPhone) {
            var searchParams;
            if (userPhone) {
                searchParams = [{"phone_number": userPhone}];
            }
            else {
                searchParams = [{"name": userName}];
            }

            return (userRequest.send(
                'POST',
                '/users/search',
                {
                    "search_params": searchParams
                }
            ));
        },

        getCategories: function() {
            return (userRequest.send(
                'GET',
                '/categories'
            ));
        },

        addNewCategory: function(name) {
            return (userRequest.send(
                'POST',
                '/categories',
                {
                    "category": {"name": name}
                }
            ));
        },

        removeCategory: function(categoryId) {
            return (userRequest.send(
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

            return (userRequest.send(
                'PUT',
                '/categories/' + categoryId,
                {
                    "category": categoryData
                }
            ));
            
        },

        addStickerURL: function(categoryId, imageURL) {
            return (userRequest.send(
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
                            "Authorization": "Token token=" + user.accessToken
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

        uploadImage: function(file) {
            var d = $q.defer();
            fileTypeDeterminer.detect(file,
                function(type) {

                    $upload.upload({
                        method: 'POST',
                        url: config('apiUrl') + "/images/load_image",
                        headers: {
                            "Authorization": "Token token=" + user.accessToken
                        },
                        file: file,
                        fileName: "image." + type,
                        fileFormDataName: "image[image_data]"
                    })
                        .then(
                        function(res) {
                            d.resolve(res.data);
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
            return (userRequest.send(
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
                        
            return (userRequest.send(
                'DELETE',
                url
            ));
        },

        initPhoneActivation: function(phoneNumber) {
            // todo: redo to send with token
            return (guestRequest.send(
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

            return (userRequest.send(
                'POST',
                '/phone_number/confirm',
                data
            ));
        },

        attachPhoneNumber: function(phoneNumber) {
            return (userRequest.send(
                'POST',
                '/phone/activation/attach',
                {
                    "phone_number": phoneNumber
                }
            ));
            
        },

        findNepotomUsers: function(phoneNumbersArr) {
            return (userRequest.send(
                'POST',
                '/users/phonebook_search',
                {
                    "phonebook": phoneNumbersArr
                }
            ));
        },

        getUserInfoByUuid: function(uuid) {
            return (userRequest.send(
                'POST',
                '/users',
                {
                    "user_uuid": uuid
                }
            ));
        },

        addVirtualAccount: function() {
            return (userRequest.send(
                'POST',
                '/users/guest'
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
                return (userRequest.send(
                    'PATCH',
                    '/set_friends',
                    {
                        "friends": friendsArray
                    }

                ));
            }
        },

        removeFriend: function(uuids) {
            return (userRequest.send(
                'PATCH',
                '/delete_friends',
                {
                    "uuids": uuids
                }           
            ));
        },

        socialSignin: function(provider, providerId, providerToken) {
            
            return (userRequest.send(
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

            return (userRequest.send(
                'POST',
                '/random',
                data
            ));
        },

        cancelRandomRequest: function() {
            return (userRequest.send('DELETE', '/random'));
        },

        deleteChat: function(channel) {
            return (userRequest.send(
                'DELETE',
                '/chats/' + channel
            ))
            .then(function(res) {
                log(res);
            });
        }
    };

    return api;
}]);
