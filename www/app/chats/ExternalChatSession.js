(function(){
    services
        .factory('ExternalChatSession',
        ['$q', 'ChatSessionAbstract', 'apiRequest', 'notification',
function($q, ChatSessionAbstract, apiRequest, notification) {

    return Session;
    function Session(chat, partner_id) {

        var self = this;

        var lastAuthor, rows = 0, incentives = 0, startTime, isClosed;

        this.type = 'external';
        this.chat = chat;
        this.senderId = partner_id;
        this.isExpired = false;
        this.isReplied = false;
        this.channelName = null;
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

        // Оповещается из externalChat:
        self.myMessageSent = function(message) {
            // или же показывать queued_message ?
            self.addMessage({
                text: message.sanitize(),
                isOwn: true
            });
            deferred_send.resolve();
            swap('me');
        };

        self.messageFromPartner = function(message) {
            swap('he');
        };

        function swap(writer) {
            rows++;
            if (lastAuthor == 'me' && writer == 'he') incentives++;
            if (!startTime) startTime = Date.now();
            lastAuthor = writer;
        }

        self.saveLog = function() {
            if (isClosed) return;

            isClosed = true;
            self.sessionFinished();

            var duration = (Date.now() - startTime)/1000;
            if (rows < 1 || duration < 10) return;

            var data = {
                uuid: self.uuid,
                rows: rows,
                incentives: incentives,
                duration: duration
            };
            apiRequest.send('POST', '/chats/log', data);
        };

        angular.extend(this, new ChatSessionAbstract());
    }
}]);

})();