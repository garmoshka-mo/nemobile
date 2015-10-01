angular.module("angServices")
.service('random', ['user', '$q', 'externalChat', 'userRequest', '$rootScope', 'googleAnalytics',
    function(user, $q, externalChat, userRequest, $rootScope, googleAnalytics) {

        this.waitingServer = false;
        this.lookupInProgress = false;
        var self = this,
            lastInternalChannel;

        function sendRequest(data) {
            return userRequest.send(
                'POST',
                '/random',
                data
            ).then(function(data) {
                    externalChat.level = data.score;
                });
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

        $(window).bind('unload', function() {
            if (self.lookupInProgress)
                userRequest.sendSync('DELETE', '/random');
            else if(lastInternalChannel)
                // todo: replace to signal 'partner_has_closed_app'
                userRequest.sendSync('DELETE', '/chats/' + lastInternalChannel);
        });

}]);