angular.module("angServices")
.service('random', ['user', '$q', 'ExternalChat', 'userRequest', '$rootScope', 'googleAnalytics',
    function(user, $q, ExternalChat, userRequest, $rootScope, googleAnalytics) {

        this.waitingServer = false;
        this.lookupInProgress = false;

        var self = this,
            lastInternalChannel,
            externalInstance,
            silentStop;

        this.isSearching = function() {
            return this.lookupInProgress && !silentStop;
        };

        this.getExternalInstance = function() {
            if (externalInstance) return externalInstance;

            var dummy = new ExternalChat({}); // Empty chat for reloaded page
            dummy.createEmptySession();
            return dummy;
        };

        function onRandomChatOpen(type) {
            log('onRandomChatOpen', type);
            if (type == 'external')
                cancelInternalLookingFor();
            else
                cancelExternalLookingFor();

            self.lookupInProgress = false;
        }

        function cancelExternalLookingFor() {
            if (externalInstance)
                externalInstance.disconnect();
        }

        function cancelInternalLookingFor() {
            return userRequest.send('DELETE', '/random');
        }

        $rootScope.$on('new random chat', function(event, args) {
            googleAnalytics.setLookForChat(false);
            googleAnalytics.dialogStart();
            onRandomChatOpen(args.type);

            if (args.type == 'internal')
                lastInternalChannel = args.channel;
            else
                lastInternalChannel = null;
        });

        this.lookForChat = function(preferences) {
            var d = $q.defer();

            googleAnalytics.setUserPreferences(preferences);
            googleAnalytics.setLookForChat(true);

            self.waitingServer = true;
            self.lookupInProgress = true;

            silentStop = false;
            localStorage.setItem('randomSearchStarted', Date.now());

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

            function sendRequest(data) {
                if (silentStop) return $q.when(true);
                return userRequest.send(
                    'POST',
                    '/random',
                    data
                ).then(function(data) {
                    if (self.lookupInProgress && !silentStop && config('externalChat')) {
                        externalInstance = new ExternalChat(preferences, data.score);
                        externalInstance.schedule_start();
                    }
                });
            }

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

        window.addEventListener('storage', function (event) {
            if (event.key == 'randomSearchStarted') {
                if (self.lookupInProgress) cancelExternalLookingFor();
                silentStop = true;
                log('silent stop');
            }
        }, false);

        $(window).bind('unload', function() {
            if (self.lookupInProgress)
                userRequest.sendSync('DELETE', '/random');
            else if(lastInternalChannel)
                // todo: replace to signal 'partner_has_closed_app'
                userRequest.sendSync('DELETE', '/chats/' + lastInternalChannel);
        });

}]);