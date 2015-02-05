services
.factory('friendsList', ['$rootScope', '$q', 'Friend', 'storage', 'api', 
    function($rootScope, $q, Friend, storage, api) {

    var friendsList = {

        friends: [],
        nepotomFriends: {},
        lastContactId: null,
        addFriend: function(friendData) {
            var friend = new Friend(friendData);
            this.friends.push(friend);
            if (friend.uuid) {
                this.nepotomFriends[friend.uuid] = friend;
            }
        },

        getUserContacts: function() {
            var q = $q.defer();
            
            if (navigator.contacts) {
                navigator.contacts.find(
                    ['displayName', 'phoneNumber'], 
                    function(contacts) {
                        q.resolve(parseUserContacts(contacts));
                    },
                    onError,
                    {multiple: true}
                );
            }
            else {
                q.reject("contacts is not defined");
            }
            return q.promise;
        },

        save: function() {
            storage.saveFriendsList(this);
            console.log("friends list is saved");
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
        }

    };

    //private methods
    function parseUserContacts(contacts) {
        var lastContactIndex = contacts.length - 1;
        var lastContactId = +contacts[lastContactIndex].id;

        console.log(lastContactId);
        console.log(friendsList);

        //checking if there are new contacts
        if (lastContactId > friendsList.lastContactId) {
            var newContacts = [];
            for (var i = lastContactIndex; i > 0; i--) {
                if (contacts[i].id > friendsList.lastContactId) {
                    var newFriend = new Friend(contacts[i]);
                    friendsList.friends.push(newFriend);
                    newContacts.push(nf);
                }
                else {
                    break;
                }
            }
            friendsList.lastContactId = +contacts[lastContactIndex].id;
        }

        findNepotomUsers(newContacts);
        friendsList.save();
    }

    function findNepotomUsers(newFriendsList) {
        var phoneNumbersArr = [];
        var phoneNumbersUsers = {};
        
        newFriendsList.forEach(function(friend) {
            friend.phoneNumbers.forEach(function(phoneNumber) {
                phoneNumbersArr.push(phoneNumber);
                phoneNumbersUsers[phoneNumber] = friend;
            });
        });

        api.findNepotomUsers(phoneNumbers)
        .then(function(res) {
            for (var key in res.search_results) {
                var uuid = res.search_results[key];
                phoneNumbersUsers[key].setUuid(uuid);
                friendsList.nepotomFriends[uuid] = phoneNumbersUsers[key];
                console.log("user is added to nepotom friends"); 
            }
            friendsList.save();
        });

    }

    function onError(err) {
        console.log(err);
    }

    return friendsList;
}]);