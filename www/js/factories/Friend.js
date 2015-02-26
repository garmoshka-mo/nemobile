factories.factory("Friend", ['storage', 'ChatSession', function(storage, ChatSession) {
    
    function Friend(fields) {
        if (fields) {
            if (fields.displayName) {
                this.displayName = fields.displayName;    
            }
            else {
                if (fields.name) {
                    this.displayName = fields.name.formatted;
                }
            }
            this.phoneNumbers = fields['phoneNumbers'];
            this.photos = fields['photos'];
            this.uuid = fields['uuid'];
            this.id = fields['id'];
            
            if (fields.whenCreated) {
                this.whenCreated = fields.whenCreated;
            }
            else {
                this.whenCreated = new Date().getTime();
            }
        }
        else {
            console.error("Friend constructor is called without necessary data");
        }
    }

    Friend.prototype = {
        setUuid: function(uuid) {
            this.uuid = uuid; 
        },
        addPhoneNumber: function(phoneNumber) {
            this.phoneNumbers.push({value: phoneNumber});
        },
        update: function(contactObj) {
            this.displayName = contactObj.name.formatted;
            this.phoneNumbers = contactObj.phoneNumbers;
            this.photos = contactObj.photos;
        }
    };

    return Friend;

}]);