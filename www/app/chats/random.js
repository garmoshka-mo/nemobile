services
.service('random', ['user', '$q', 'externalChat', 'apiRequest', '$rootScope',
    function(user, $q, externalChat, apiRequest, $rootScope) {

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

        function onRandomChatOpen() {
            self.lookupInProgress = false;
        }

        $rootScope.$on('new random chat', onRandomChatOpen);

        this.lookForChat = function(preferences) {
            var d = $q.defer();

            self.waitingServer = true;
            self.lookupInProgress = true;

            function onSendRequestSuccess () {
                self.waitingServer = false;
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

            log(self);
            return d.promise;
        };

        this.cancelLookingFor = function() {
            self.waitingServer = true;
            externalChat.disconnect();
            return apiRequest.send('DELETE', '/random')
            .then(function() {
                self.waitingServer = false;
                self.lookupInProgress = false;
            });
        };

       
        
        window.onunload = function() {
            apiRequest.sendSync('DELETE', '/random');
        };

}]);