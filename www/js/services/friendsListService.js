services
.factory('friendsList', ['$rootScope', '$q', 'Friend', 'storage', function($rootScope, $q, Friend, storage) {

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

        if (lastContactId > friendsList.lastContactId) {
            contacts.forEach(function(contact, index) {
                friendsList.friends.push(new Friend(contact));
            });
            friendsList.lastContactId = +contacts[lastContactIndex].id;
        }

        friendsList.save();
    }

    function onError(err) {
        console.log(err);
    }

    return friendsList;
}]);