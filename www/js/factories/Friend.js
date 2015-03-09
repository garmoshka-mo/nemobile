factories.factory("Friend", ['storage', 'ChatSession', function(storage, ChatSession) {
    
    
    function getContactName(fields) {
        var name = "без имени";
        
        if (fields.displayName) {
            name = fields.displayName;    
        }
        else if (fields.name) {
            if (fields.name.formatted) {
                name = fields.name.formatted;
            }
            else if (fields.emails) {
                name = fields.emails[0].value;
            }
        }
      
        return name;
    }

    function Friend(fields) {
        if (fields) {
            this.displayName = getContactName(fields);
            this.phoneNumbers = fields.phoneNumbers;
            this.photos = fields.photos;
            this.uuid = fields.uuid;
            this.id = fields.id;
            this.emails = fields.emails;
            
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
            this.displayName = getContactName(contactObj);
            this.phoneNumbers = contactObj.phoneNumbers;
            this.photos = contactObj.photos;
            this.emails = contactObj.emails;
        }
    };

    return Friend;

}]);