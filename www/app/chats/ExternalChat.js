(function(){
angular.module("angServices")
    .factory('ExternalChat',
    ['Avatar', '$q', '$rootScope', 'ExternalChatSession',
        'ExternalProvider', 'notification', 'ChatAbstract',
function(Avatar, $q, $rootScope, ExternalChatSession,
         ExternalProvider, notification, ChatAbstract) {

    return ExternalChat;

    function ExternalChat(preferences, level) {

        new ChatAbstract().extend(this);

            var self = this;
            self.chat = null;
            self.type = 'external';
            self.title = "кто-то";
            self.created_at = Date.now();
            self.myIdx = 'me';
            self.isActive = true;

            notification.asked = 0;

            var partner_id, start_timer, externalProvider, session;


            self.schedule_start = function() {
                start_timer = setTimeout(self.startNewSession, 500);
            };

            self.startNewSession = function(withEmergency) {
                initSession();
                externalProvider = new ExternalProvider(self, session, preferences, level, withEmergency);
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
                session.sessionFinished(true);
                self.isActive = false;
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

            self.disconnect = function(byPartner, feedback) {
                self.isActive = false;
                log('chat.disconnect');
                clearTimeout(start_timer);
                if (externalProvider) {
                    externalProvider.quit();
                    session.sessionFinished(false, feedback);
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