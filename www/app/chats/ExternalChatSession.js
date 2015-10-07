(function(){
    angular.module("angServices")
        .factory('ExternalChatSession',
        ['$q', 'ChatSessionAbstract', 'userRequest',
function($q, ChatSessionAbstract, userRequest) {

    return Session;
    function Session(chat, partner_id) {

        var self = this;

        this.type = 'external';
        this.chat = chat;
        this.senderId = partner_id;
        this.isExpired = false;
        this.isReplied = false;
        this.channel = null;
        this.messages = [];
        this.timer = null;
        this.creatorId = null;
        this.currentChat = null;
        this.whenExipires = Infinity;

        self.setReplied = function() {self.isReplied = true;};

        self.save = function() {
            //storage.saveChatSession(this, this.currentChat[this.currentChat.primaryKey]);
            //log("chat session is saved");
            log("chat session saving skipped");
        };

        self.getLastMessage = function() {
            if (self.messages.length) {
                var messagesAmount = self.messages.length;
                var text = self.messages[messagesAmount - 1].text;
                return text.sanitize();
            }
        };

        var queued_message, deferred_send;

        self.sendMessage = function(message) {
            queued_message = message;
            self.chat.sendMyMessage(message);

            deferred_send = $q.defer();
            return deferred_send.promise;

            // Ошибки тут не поддерживаются по-ходу
            // return $q.reject(res.data.error);

        };

        self.afterMyMessageSent = function() {
            deferred_send.resolve();
        };

        self.saveLog = function() {
            if (this.isClosed) return;

            var log = self.myScores.getLog();
            if (log.duration > 10) {
                log.uuid = self.uuid;
                userRequest.send('POST', '/chats/log', log);
            }
        };

        angular.extend(this, new ChatSessionAbstract());
    }
}]);

})();