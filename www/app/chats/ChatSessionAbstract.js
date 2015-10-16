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
            } else {
                msg.text = message;
                notification.incomeMessage();

                logExternal({event: 'message',
                    channel: self.uuid,
                    payload: {sender_idx: 'he', sender_uuid: user.uuid, text: message}});
            }

            self.messages.push(msg);
        };

        self.myMessageSent = function(text) {
            var msg = {
                text: text.sanitize(),
                isOwn: true
            };

            self.messages.push(msg);

            logExternal({event: 'message',
                channel: self.uuid,
                payload: {sender_idx: 'me', sender_uuid: user.uuid, text: text}});

            if (self.afterMyMessageSent) self.afterMyMessageSent();
        };

        self.conversationBegan = function() {
            logExternal({event: 'chat_ready',
                channel: self.uuid,
                payload: {sender_uuid: user.uuid}});
        };

        self.sessionFinished = function(byPartner, feedback) {
            if (self.isClosed) return;
            self.isClosed = true;

            user.save();
            timer.stop();

            logExternal({event: 'chat_empty',
                channel: self.uuid,
                payload: {sender_idx: byPartner ? 'he' : 'me',
                        sender_uuid: user.uuid, feedback: feedback
                }
            });
        };

        function logExternal(envelope) {
            if (self.type=='external') {
                socket.emit('externalLog', envelope);
            }
        }
    }

}]);

})();

