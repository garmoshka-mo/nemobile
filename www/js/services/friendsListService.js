services
.factory('friendsList', ['$rootScope', '$q', 'Friend', 'storage', 'api', 
    function($rootScope, $q, Friend, storage, api) {
    
        var isNepotomFriendsInfoUpdated = false;

        //private methods
        function hasPhoneNumber(contact) {
            return !!contact.phoneNumbers;
        }

        function hasLocalImage(contact) {
            if (!contact.photos) {
                return false;
            }
            
            if (contact.photos) {
                return contact.photos[0].value.match(/content:\/\//) ?
                    true : false;
            }
        }

        function imageExists(url) {
            var d = $q.defer();
            var img = new Image();
            
            img.onload = function() { d.resolve(); };
            img.onerror = function() { d.reject(); };
            img.src = url;
            
            return d.promise;
        }

        function addFriendFromLocalContacts(contact) {
            var newFriend = new Friend(contact);
            friendsList.friends.push(newFriend);
            return newFriend;
        }

        function onImageExist(contact, link) {
            contact.photos = [{value: link}];
        }

        function onImageAbsence(contact) {
            return function() {
                contact.photos = null;
            };
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

                            if (hasLocalImage(newFriend)) {
                                var linkToCheck = newFriend.photos[0].value;
                                //setting null, while image is being checked
                                newFriend.photos = null;

                                imageExists(linkToCheck)
                                .then(
                                    onImageExist(newFriend, linkToCheck),
                                    onImageAbsence(newFriend)
                                );
                            }
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
                    console.log("find nepotom users res:", res);
                    for (var key in res.search_results) {
                        var uuid = res.search_results[key];
                        phoneNumbersUsers[key].setUuid(uuid);
                        friendsList.nepotomFriends[uuid] = phoneNumbersUsers[key];
                        console.log("user is added to nepotom friends");
                    }
                    friendsList.save();
                });
            }

        }

        function onError(err) {
            console.log(err);
        }
        
        function saveFriendsOnServer(friendsObj) {
            api.setFriends(_.values(friendsObj));
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
                // console.log('notSaveOnServer', notSaveOnServer);
                if (!notSaveOnServer) {
                    saveFriendsOnServer(this.nepotomFriends);
                    console.log('friends list is sent to server');
                }
                storage.saveFriendsList(this);
                console.log("friends list is saved");
            },
            
            addFriend: function(friendData, notSaveOnServer) {
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
                            q.resolve(parseUserContacts(contacts));
                            console.timeEnd('getting user contacts from phonebook');
                        },
                        onError,
                        {multiple: true}
                    );
                }
                else {
                    if (App.Settings.environment === "development") {
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

            parseFromStorage: function(dataFromStorage) {
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
                                // console.log(res);
                                var photoUrl, photoUrlMini;
                                if (res.user.avatar_guid || res.user.avatar_url) {
                                    photoUrl = user.parseAvatarDataFromServer(res.user).fullSize;
                                    photoUrlMini = user.parseAvatarDataFromServer(res.user).mini;
                                }
                                else {
                                    photoUrl = App.Settings.adorableUrl + '/' + uuid;
                                    photoUrlMini = App.Settings.adorableUrl + '/40/' + uuid;
                                }
                                self.nepotomFriends[uuid].photos = [{
                                    value: photoUrl,
                                    valueMini: photoUrlMini
                                }];
                                // console.log(uuid);
                                // console.log(self.nepotomFriends[uuid]);
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