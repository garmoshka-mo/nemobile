(function(){
    angular.module("angFactories").factory('ChatSessionAbstract',
        ['notification', 'SpamFilter', 'timer', 'ScoreKeeper',
            'user', 'socket', 'bubble',
function(notification, SpamFilter, timer, ScoreKeeper,
         user, socket, bubble) {

    return function AbstractSession() {

        var self = this;
        self.extend = function(child) {
            angular.extend(child, self);
            self = child;
        };

        self.uuid = generateUuid();
        self.filter = new SpamFilter(self);
        self.isClosed = false;

        self.myScores = new ScoreKeeper('My scores', 1);
        self.partnerScores = new ScoreKeeper('Partner scores', 1);

        function generateUuid() {
            var u = Date.now().toString().substr(7);
            u += Math.round(Math.random()*100).toString();
            return btoa(u);
        }

        var hisStrafeShow = false;

        self.updateScores = function(scores) {
            Object.keys(scores).map(function(idx) {
                if (idx == self.chat.myIdx) {
                    self.myScores.update(scores[idx]);
                    bubble.checkForStrafe(scores[idx], 'me');
                } else {
                    self.partnerScores.update(scores[idx]);

                    if (!hisStrafeShow)
                        hisStrafeShow = bubble.checkForStrafe(scores[idx], 'he');
                }
            });
        };

        self.incomeMessage = function(message){
            var msg = {
                isOwn: false
            };

            if (message.type) {
                msg.type = message.type;
                msg.feedback = message.feedback;
                // For debug:
                if (message.type =='chat_finished') {
                    filter({
                        text: '=== Собеседник покинул чат ===',
                        isOwn: false
                    });
                }
            } else {
                msg.text = message;
                notification.incomeMessage();
                filter(msg);

                logExternal({event: 'message',
                    channel: self.uuid,
                    payload: {sender_idx: 'he', text: message}});
            }

            self.messages.push(msg);
        };

        self.myMessageSent = function(text) {
            var msg = {
                text: text.sanitize(),
                isOwn: true
            };

            filter(msg);
            self.messages.push(msg);

            logExternal({event: 'message',
                channel: self.uuid,
                payload: {sender_idx: 'me', text: text}});

            if (self.afterMyMessageSent) self.afterMyMessageSent();
        };

        self.conversationBegan = function() {
            logExternal({event: 'chat_ready', channel: self.uuid});
        };

        self.sessionFinished = function(byPartner) {
            if (self.isClosed) return;
            self.isClosed = true;

            user.save();
            timer.stop();

            logExternal({event: 'chat_empty',
                channel: self.uuid,
                payload: {sender_idx: byPartner ? 'he' : 'me'}});
        };

        function filter(msg) {
            if (self.type == 'external')
                self.filter.log(msg);
        }

        function logExternal(envelope) {
            if (self.type=='external') {
                socket.emit('externalLog', envelope);
            }
        }
    }

}]);

})();

