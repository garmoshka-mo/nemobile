factories.factory("User", ['$rootScope', function($rootScope) {
    
    function User(accessToken, name, uuid, channel) {
        this.name = name;
        this.uuid = uuid;
        this.accessToken = accessToken;
        this.channel = channel;
        this.friends = {},
        this.chats = {}
    }

    return User;
}])