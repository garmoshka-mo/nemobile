(function(){
services
    .service('externalChat',
    ['avatars', '$q', '$rootScope', 'externalChatSession', 'Bot',
    function(avatars, $q, $rootScope, externalChatSession, Bot) {

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
            self.preferences = preferences;
            self.chat = null;
            self.provider = null;
            self.title = "кто-то";

            var partner_id, start_timer, bot, lastUnexpiredChatSession;


            self.schedule_start = function() {
                start_timer = setTimeout(self.startNewSession, 6000);
            };

            self.startNewSession = function() {
                initSession();
                bot = new Bot(self, lastUnexpiredChatSession);
            };

            function initSession() {
                partner_id = Math.random();
                lastUnexpiredChatSession = new externalChatSession(self, partner_id);

                self.lastUnexpiredChatSession = lastUnexpiredChatSession; // todo: remove after refactoring
                self.chatSessionsIndexes = [lastUnexpiredChatSession.id];
                self.ava = avatars.from_id(partner_id);
                self.photoUrl = self.ava.url;
                self.photoUrlMini = self.ava.url_mini;
            }
            self.createEmptySession = initSession;

            self.reportStatusIfInactive = function() {
                if (!(self.provider))
                    self.display_partners_message({type: 'chat_empty'});
            };

            self.display_partners_message = function(message) {
                log('Собеседник:');
                log(message);
                setTimeout(function() {
                    $rootScope.$apply(function(){
                        lastUnexpiredChatSession.incomeMessage(message);
                    });
                }, 0);
            };

            self.sendMyMessage = function(m) {
                self.provider.Send(m.escape());
            };

            self.disconnect = function() {
                clearInterval(start_timer);
                if (bot) bot.quit();
                if (self.provider) self.provider.Disconnect();
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