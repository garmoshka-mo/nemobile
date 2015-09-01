(function(){
services
    .service('externalChat',
    ['avatars', '$q', '$rootScope', 'ExternalChatSession', 'ExternalProvider', 'notification',
    function(avatars, $q, $rootScope, ExternalChatSession, ExternalProvider, notification) {

        var self = this;

        self.start = function(preferences) {
            self.current_instance = new ExternalChat(preferences);
            self.current_instance.schedule_start();
        };

        self.disconnect = function() {
            if (self.current_instance) self.current_instance.disconnect();
        };

        self.current_instance = new ExternalChat({}); // Empty chat for reloaded page
        self.current_instance.createEmptySession();



        function ExternalChat(preferences) {
            var self = this;
            self.chat = null;
            self.title = "кто-то";

            notification.asked = 0;

            var partner_id, start_timer, externalProvider, lastUnexpiredChatSession;


            self.schedule_start = function() {
                start_timer = setTimeout(self.startNewSession, 6000);
            };

            self.startNewSession = function() {
                initSession();
                externalProvider = new ExternalProvider(self, lastUnexpiredChatSession, preferences);
            };

            function initSession() {
                partner_id = Math.random();
                lastUnexpiredChatSession = new ExternalChatSession(self, partner_id);

                self.lastUnexpiredChatSession = lastUnexpiredChatSession; // todo: remove after refactoring
                self.chatSessionsIndexes = [lastUnexpiredChatSession.id];
                self.ava = avatars.from_id(partner_id);
                self.photoUrl = self.ava.url;
                self.photoUrlMini = self.ava.url_mini;
            }
            self.createEmptySession = initSession;

            self.reportStatusIfInactive = function() {
                if (!externalProvider)
                    self.display_partners_message({type: 'chat_empty'});
            };

            self.display_partners_message = function(message) {
                setTimeout(function() {
                    $rootScope.$apply(function(){
                        lastUnexpiredChatSession.incomeMessage(message);
                    });
                }, 0);
            };

            self.sendMyMessage = function(m) {
                externalProvider.send(m);
            };

            self.disconnect = function() {
                log('chat.disconnect');
                clearInterval(start_timer);
                if (externalProvider) externalProvider.quit();
            };

            self.typing = function() {
                externalProvider.typing();
            };

            // todo: remove this after refactoring
            self.getLastUnexpiredChatSession = function() {
                return $q.when(true);
            };

            self.updateInfo = function() {
                return $q.when(true);
            };
        }
    }]);

})();