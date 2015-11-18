angular.module('angServices').service('secret', [
    '$rootScope', '$q', 'userRequest', 'socket', 'chats',
    function($rootScope, $q, userRequest, socket, chats) {
        var self = this;

        this.dummySession = {
            messages: [

            ]
        };

        this.sendSecret = function(account, provider, text, expiresSec) {
            var data = {
                provider_account: {
                    account: account ? account : '',
                    provider: provider
                },
                messages: [{ text: text, isOwn: false }],
                expires_sec: expiresSec
            };

            return userRequest.sendForSure('POST', '/secret', data);
        };

        this.getSecret = function(shortCode) {
            return userRequest.send('GET', '/secret/' + shortCode);
        };

        this.replyToSecret = function(shortCode) {
            return userRequest.sendForSure('PATCH', '/secret/' + shortCode, {messages: self.fakeSession.messages});
        };

        this.formatAccount = function(account) {
            if (account)
                return (account.charAt(0) != '@'? '@'+ account: account)
                    .toLowerCase().trim();
        }

    }]);





