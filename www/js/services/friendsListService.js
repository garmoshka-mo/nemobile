services
.factory('friendsList', ['$rootScope', '$q', 'Friend', function($rootScope, $q, Friend) {

    var friendsList = {

        friends: [],
        nepotomFriends: {},
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
                        q.resolve(parseUserContacts(contacts))
                    },
                    onError,
                    {multiple: true}
                )
            }
            else {
                q.reject("contacts is not defined");
            }
            return q.promise;
        },

        parseFromStorage: function(dataFromStorage) {

        }

    }

    //private methods
    function parseUserContacts(contacts) {
        contacts.forEach(function(contact) {
            friendsList.friends.push(new Friend(contact));
        })
    }

    function onError(err) {
        console.log(err);
    }

    return friendsList;
}])