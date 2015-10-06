angular.module("angServices")
.factory('friendsList', ['$rootScope', '$q', 'Friend', 'storage', 'userRequest',
    function($rootScope, $q, Friend, storage, userRequest) {
    
        var isNepotomFriendsInfoUpdated = false;

        //private methods
        function hasPhoneNumber(contact) {
            return !!contact.phoneNumbers;
        }

        function addFriendFromLocalContacts(contact) {
            var newFriend = new Friend(contact);
            friendsList.friends.push(newFriend);
            return newFriend;
        }

        function parseUserContacts(contacts) {
            console.time('parsing user contacts');
            var q = $q.defer();

            var lastContactIndex = _.findLastIndex(contacts);
            var lastContactId = +contacts[lastContactIndex].id;

            //checking if there are new contacts
            if (lastContactId > friendsList.lastContactId) {
                var newContacts = [];
                for (var i = lastContactIndex; i >= 0; i--) {
                    if (contacts[i].id > friendsList.lastContactId) {
                        if (hasPhoneNumber(contacts[i])) {
                            var newFriend = addFriendFromLocalContacts(contacts[i]); 
                            newContacts.push(newFriend);
                        }
                    }
                    else {
                        break;
                    }
                }
                friendsList.lastContactId = +contacts[lastContactIndex].id;
            }

            //updating previous ones
            contacts.forEach(function(contact) {
                var friend = _.find(friendsList.friends, {"id": contact.id});
                if (friend) {
                    friend.update(contact);
                }
            });

            console.timeEnd('parsing user contacts');
            findNepotomUsers(newContacts);
            q.resolve();

            return q.promise;
        }

        function findNepotomUsers(newFriendsList) {
            var phoneNumbersArr = [];
            var phoneNumbersUsers = {};
            
            if (newFriendsList) {
                newFriendsList.forEach(function(friend) {
                    if (friend.phoneNumbers) {
                        friend.phoneNumbers.forEach(function(phoneNumber) {
                            phoneNumbersArr.push(phoneNumber.value);
                            phoneNumbersUsers[phoneNumber.value] = friend;
                        });
                    }
                });
            }

            if (phoneNumbersArr.length) {
                api.findNepotomUsers(phoneNumbersArr)
                .then(function(res) {
                    log("find nepotom users res:", res);
                    for (var key in res.search_results) {
                        var uuid = res.search_results[key];
                        phoneNumbersUsers[key].setUuid(uuid);
                        friendsList.nepotomFriends[uuid] = phoneNumbersUsers[key];
                        log("user is added to nepotom friends");
                    }
                    friendsList.save();
                });
            }

        }

        function onError(err) {
            log(err);
        }
        
        function saveFriendsOnServer(friendsObj) {
            api.setFriends(_.values(friendsObj));
        }

        function getUserFriendsFromServer() {
            var NOT_SENT_CHANGES_TO_SERVER = true;
            return userRequest.send(
                'GET',
                '/get_friends'
            )
            .then(function(res) {
                // deleting deleted friends
                var serverUuids = _.map(res.friends, 'uuid');
                var userFriendsUuids = _.map(user.friendsList.nepotomFriends, 'uuid');
                var deletedUuids = _.difference(userFriendsUuids, serverUuids);
                deletedUuids.forEach(function(uuid) {
                    user.friendsList.removeFriend(user.friendsList.nepotomFriends[uuid], 
                        NOT_SENT_CHANGES_TO_SERVER);
                });
                //adding new one
                res.friends.forEach(function(friendData) {
                    user.addFriend({
                        uuid: friendData.uuid,
                        name: friendData.display_name,
                        created: friendData.created_at,
                        avatarObj: user.parseAvatarDataFromServer(friendData)
                    }, NOT_SENT_CHANGES_TO_SERVER);
                });
            });
        }

        function loadFromStorage(dataFromStorage) {
            if (dataFromStorage) {
                var self = this;
                dataFromStorage.friends.forEach(function(friendData) {
                    var friend = new Friend(friendData);
                    self.friends.push(friend);
                    if (friend.uuid) {
                        self.nepotomFriends[friend.uuid] = friend;
                    }
                });
                self.lastContactId = dataFromStorage.lastContactId;
            }
        }

        //public 
        var friendsList = {

            friends: [],
            nepotomFriends: {},
            lastContactId: null,
            gotUserContacts: false,

            clear: function() {
                this.friends = [];
                this.nepotomFriends = {};
                this.lastContactId = null;
                this.gotUserContacts = false;
            },

            save: function(notSaveOnServer) {
                // log('notSaveOnServer', notSaveOnServer);
                if (!notSaveOnServer) {
                    saveFriendsOnServer(this.nepotomFriends);
                    log('friends list is sent to server');
                }
                storage.saveFriendsList(this);
                log("friends list is saved");
            },
            
            addFriend: function(rawData, notSaveOnServer) {
                var photos = rawData.avatarObj ? 
                    [{value: rawData.avatarObj.fullSize, valueMini: rawData.avatarObj.mini}] : null;
                var emails = rawData.email ? 
                    [{value: rawData.email}] : null;
                var phoneNumbers = rawData.phoneNumber ? 
                    [{value: phoneNumber}] : null;
                var friendData = {
                    displayName: rawData.name,
                    uuid: rawData.uuid,
                    photos: photos,
                    created: rawData.created ? rawData.created : null,
                    emails: emails,
                    phoneNumbers: phoneNumbers
                };    

                if (!this.nepotomFriends[friendData.uuid]) {
                    var friend = new Friend(friendData);
                    this.friends.push(friend);
                    if (friend.uuid) {
                        this.nepotomFriends[friend.uuid] = friend;
                    }
                    this.save(notSaveOnServer);
                }
            },

            removeFriend: function(friend, notSaveOnServer) {
                var indexToRemove = this.friends.indexOf(friend);
                var uuidToRemove = friend.uuid;
                
                var _nepotomFriends = {};
                if (indexToRemove !== -1) {
                    this.friends.splice(indexToRemove, 1);

                    for (var key in this.nepotomFriends) {
                        if (key == uuidToRemove) {
                            continue;
                        }
                        else {
                            _nepotomFriends[key] = this.nepotomFriends[key];
                        }
                    }
                    this.nepotomFriends = _nepotomFriends;
                }
                
                if (!notSaveOnServer) {
                    api.removeFriend([uuidToRemove]);
                }
                this.save(notSaveOnServer);
            },

            getUserContacts: function() {
                var self = this;
                console.time('getting user contacts from phonebook');
                var q = $q.defer();
                
                if (navigator.contacts) {
                    // //for testing purposes (adds 1000 contacts)
                    // q.resolve(parseUserContacts(testDataset));
                    
                    navigator.contacts.find(
                        ['displayName', 'phoneNumber'], 
                        function(contacts) {
                            self.gotUserContacts = true;
                            log('!!!!!!!!!!!!!!', contacts);
                            if (contacts) {
                                q.resolve(parseUserContacts(contacts));
                            }
                            console.timeEnd('getting user contacts from phonebook');
                        },
                        onError,
                        {multiple: true}
                    );
                }
                else {
                    if (config('environment') === "development") {
                        self.gotUserContacts = true;
                        q.resolve(parseUserContacts(testDataset));
                    }
                    else {
                        q.reject("contacts is not defined");
                    }
                    console.timeEnd('getting user contacts from phonebook');
                }
                return q.promise;
            },

            loadFromStorage: function(dataFromStorage) {
                return storage.getFriendsList().then(function(dataFromStorage){
                    loadFromStorage(dataFromStorage);
                    log("user's friends list is taken from storage");
                });
            },

            transferToNepotomFriends: function(friendIndex, uuid) {
                this.friends[friendIndex].uuid = uuid;
                this.nepotomFriends[uuid] = this.friends[friendIndex];
                this.save();
            },

            updateNepotomFriendsInfo: function() {
                var self = this;
                var promises = [];
                function updateFriend(uuid) {
                    return api.getUserInfoByUuid(uuid)
                    .then(
                        function(res) {
                            if (res.success) {
                                // log(res);
                                var photoUrl, photoUrlMini;
                                if (res.user.avatar_guid || res.user.avatar_url) {
                                    photoUrl = user.parseAvatarDataFromServer(res.user).fullSize;
                                    photoUrlMini = user.parseAvatarDataFromServer(res.user).mini;
                                }
                                else {
                                    photoUrl = config('adorableUrl') + '/' + uuid;
                                    photoUrlMini = config('adorableUrl') + '/40/' + uuid;
                                }
                                self.nepotomFriends[uuid].photos = [{
                                    value: photoUrl,
                                    valueMini: photoUrlMini
                                }];
                                // log(uuid);
                                // log(self.nepotomFriends[uuid]);
                            }    
                        }
                    );

                }
                for (var uuid in self.nepotomFriends) {
                    promises.push(updateFriend(uuid));                    
                }
                return $q.all(promises).then(
                    function() {
                        self.save();
                    }
                );
            } 

        };

        return friendsList;
}]);