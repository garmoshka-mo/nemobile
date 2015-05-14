services
.factory('friendsList', ['$rootScope', '$q', 'Friend', 'storage', 'api', 
    function($rootScope, $q, Friend, storage, api) {

    var friendsList = {

        friends: [],
        nepotomFriends: {},
        lastContactId: null,

        clear: function() {
            this.friends = [];
            this.nepotomFriends = {};
            this.lastContactId = null;
        },

        save: function() {
            storage.saveFriendsList(this);
            console.log("friends list is saved");
        },
        
        addFriend: function(friendData) {
            var friend = new Friend(friendData);
            this.friends.push(friend);
            if (friend.uuid) {
                this.nepotomFriends[friend.uuid] = friend;
            }
            this.save();
        },

        removeFriend: function(friend) {
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
            
            this.save();
        },

        getUserContacts: function() {
            console.time('getting user contacts from phonebook');
            var q = $q.defer();
            
            if (navigator.contacts) {
                //for testing purposes (adds 1000 contacts)
                q.resolve(parseUserContacts(testDataset));
                
                // navigator.contacts.find(
                //     ['displayName', 'phoneNumber'], 
                //     function(contacts) {
                //         q.resolve(parseUserContacts(contacts));
                //         console.timeEnd('getting user contacts from phonebook');
                //     },
                //     onError,
                //     {multiple: true}
                // );
            }
            else {
                if (App.Settings.environment === "development") {
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
        }

    };

    //private methods
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
                    var newFriend = new Friend(contacts[i]);
                    friendsList.friends.push(newFriend);
                    newContacts.push(newFriend);
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
        friendsList.save();
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

    return friendsList;
}]);