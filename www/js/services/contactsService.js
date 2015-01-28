services
.factory('contacts', ['$rootScope', '$q', function($rootScope, $q) {
    
    function onSuccessExport(contacts) {
        var formattedContacts = {};

        contacts.forEach(function(contact) {
            contact.phoneNumbers.forEach(function(phoneNumber) {
                formattedContacts[phoneNumber.value] = phoneNumber.displayName;
            })
        })

        return formattedContacts;
    }

    function onError(err) {
        console.log(err);
    }

    return {

        get: function() {
            var q = $q.defer();
            
            if (navigator.contacts) {
                navigator.contacts.find(
                    ['displayName', 'phoneNumber'], 
                    function(contacts) {
                        q.resolve(onSuccessExport(contacts))
                    },
                    onError,
                    {multiple: true}
                )
            }
            else {
                q.reject("contacts is not defined");
            }

            return q.promise;
        }

    }
}])