services
.service('random', ['user', '$q', 'externalChat', 'apiRequest',
    function(user, $q, externalChat, apiRequest) {

        this.waitingServer = false;
        this.lookupInProgress = false;
        var self = this;

        function sendRequest(data) {
            return apiRequest.send(
                'POST',
                '/random',
                data
            );
        }

        this.lookForChat = function(preferences) {
            var d = $q.defer();

            self.waitingServer = true;

            function onSendRequestSuccess () {
                self.waitingServer = false;
                self.lookupInProgress = false;
                d.resolve();
            }

            var sendRequestPromise;
            if (user.isLogged()) {
                sendRequest(preferences)
                .then(onSendRequestSuccess);
            } 
            else {
                user.signinAsVirtualUser()
                .then(function() {
                    sendRequest(preferences)
                    .then(onSendRequestSuccess);
                });
            }

            if (config('externalChat'))
                externalChat.start(preferences);

            return d.promise;
        };

        this.cancelLookingFor = function() {
            this.waitingServer = true;
            externalChat.disconnect();
            return apiRequest.send('DELETE', '/random');
        };
        
        window.onuload = function() {
            //here disconnect request will be sent
        };

}]);