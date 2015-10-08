(function(){
angular.module("angServices")
    .factory('ExternalChat',
    ['Avatar', '$q', '$rootScope', 'ExternalChatSession', 'ExternalProvider', 'notification',
function(Avatar, $q, $rootScope, ExternalChatSession, ExternalProvider, notification) {

    return ExternalChat;

    function ExternalChat(preferences, level) {
            var self = this;
            self.chat = null;
            self.title = "кто-то";
            self.created_at = Date.now();

            notification.asked = 0;

            var partner_id, start_timer, externalProvider, session;


            self.schedule_start = function() {
                start_timer = setTimeout(self.startNewSession, 500);
            };

            self.startNewSession = function() {
                initSession();
                externalProvider = new ExternalProvider(self, session, preferences, level);
            };

            function initSession() {
                partner_id = Math.random();
                session = new ExternalChatSession(self, partner_id);

                self.lastUnexpiredChatSession = session; // todo: remove after refactoring
                self.chatSessionsIndexes = [session.id];
                self.avatar = Avatar.fromId(partner_id);
                self.channel = session.uuid;
            }
            self.createEmptySession = initSession;

            self.reportStatusIfInactive = function() {
                if (!externalProvider)
                    self.display_partners_message({type: 'chat_empty'});
            };

            self.partnerTerminated = function() {
                session.saveLog();
                session.sessionFinished(true);
                self.display_partners_message({type: 'chat_finished'});
            };

            self.display_partners_message = function(message) {
                setTimeout(function() {
                    $rootScope.$apply(function(){
                        session.incomeMessage(message);
                    });
                }, 0);
            };

            self.sendMyMessage = function(m) {
                externalProvider.send(m);
            };

            self.disconnect = function() {
                log('chat.disconnect');
                clearInterval(start_timer);
                if (externalProvider) {
                    externalProvider.quit();
                    session.saveLog();
                    session.sessionFinished(false);
                }
            };

            self.typing = function() {
                externalProvider.typing();
            };

            // todo: remove this after refactoring
            self.getLastUnexpiredChatSession = function() {
                return $q.when(session);
            };

            self.updateInfo = function() {
                return $q.when(true);
            };

            self.ensureSession = function() {
                return $q.when(session);
            };
        }
}]);

})();