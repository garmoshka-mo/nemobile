factories.factory("Friend", ['storage', 'ChatSession', function(storage, ChatSession) {
    
    function Friend(fields) {
        this.displayName = fields['displayName'];
        this.phoneNumbers = fields['phoneNumbers'];
        this.photos = fields['photos'];
        this.uuid = fields['uuid'];
        this.id = fields['id'];
    }

    Friend.prototype = {
        setUuid: function(uuid) {
            this.uuid = uuid; 
        },
        addPhoneNumber: function(phoneNumber) {
            this.phoneNumbers.push({value: phoneNumber})
        }
    }

    return Friend;

}])