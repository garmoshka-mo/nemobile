services
.service('random', ['user', '$q', 'externalChat', 'apiRequest', '$rootScope', 'googleAnalytics',
    function(user, $q, externalChat, apiRequest, $rootScope, googleAnalytics) {

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

        function onRandomChatOpen(type) {
            log(type);
            if (type == 'external') {
                cancelInternalLookingFor();
            }
            else {
                cancelExternalLookingFor();
            }
            self.lookupInProgress = false;
        }

        function cancelExternalLookingFor() {
            externalChat.disconnect();
        }

        function cancelInternalLookingFor() {
            return apiRequest.send('DELETE', '/random');
        }

        $rootScope.$on('new random chat', function(event, args) {
            googleAnalytics.setLookForChat(false);
            googleAnalytics.dialogStart();
            onRandomChatOpen(args.type);
        });

        this.lookForChat = function(preferences) {
            var d = $q.defer();

            googleAnalytics.setUserPreferences(preferences);
            googleAnalytics.setLookForChat(true);

            self.waitingServer = true;
            self.lookupInProgress = true;


            if (user.isLogged())
                requestInternalRandomChat();
            else
                user.signinAsVirtualUser().then(requestInternalRandomChat);

            function requestInternalRandomChat() {
                sendRequest(preferences).then(function onSendRequestSuccess() {
                    self.waitingServer = false;
                    d.resolve();
                });
            }

            if (config('externalChat'))
                externalChat.start(preferences);

            log(self);
            return d.promise;
        };

        this.cancelLookingFor = function() {
            googleAnalytics.boredToWait();
            self.waitingServer = true;
            cancelExternalLookingFor();
            return cancelInternalLookingFor()
            .then(function() {
                self.waitingServer = false;
                self.lookupInProgress = false;
            });
            
        };
        
        window.onunload = function() {
            if (self.lookupInProgress) {
                apiRequest.sendSync('DELETE', '/random');
            }
        };

}]);