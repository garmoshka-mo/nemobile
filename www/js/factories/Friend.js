factories.factory("Friend", ['storage', 'ChatSession', 'user', function(storage, ChatSession, user) {
    
    String.prototype.hashCode = function(){
        var hash = 0;
        if (this.length === 0) return hash;
        for (i = 0; i < this.length; i++) {
            char = this.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };
    
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

    function hasLocalImage(photos) {
        if (!photos) {
            return false;
        }
        
        if (photos) {
            return photos[0].value.match(/content:\/\//) ?
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

    function onImageExist(friend, link) {
        return function() {
            friend.photos = [{value: link}];
        };    
    }

    function onImageAbsence(friend) {
        return function() {
            console.warn(friend.displayName + ' has invalid image link');
        };
    }

    function checkImage(friend, photos) {
        var linkToCheck = photos[0].value;
        //setting null, while image is being checked
        var hash = friend.phoneNumbers[0].value.hashCode();
        var avatarObj = user.parseAvatarDataFromServer({"avatar_guid": hash});
        friend.photos = [{
            value: avatarObj.fullSize,
            valueMini: avatarObj.mini
        }];

        imageExists(linkToCheck)
        .then(
            onImageExist(friend, linkToCheck),
            onImageAbsence(friend)
        );
    }

    function Friend(fields) {
        if (fields) {
            this.displayName = getContactName(fields);
            this.phoneNumbers = fields.phoneNumbers;
            this.uuid = fields.uuid;
            this.id = fields.id;
            this.emails = fields.emails;

            if (hasLocalImage(fields.photos)) {
                checkImage(this, fields.photos);
            }
            else {
                this.photos = fields.photos;
            }
            
            if (fields.created) {
                this.created = fields.created;
            }
            else {
                this.created = new Date().getTime();
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
            this.emails = contactObj.emails;

            if (hasLocalImage(contactObj.photos)) {
                checkImage(this, contactObj.photos);
            }
            else {
                this.photos = contactObj.photos;
            }
            
        }
    };

    return Friend;

}]);