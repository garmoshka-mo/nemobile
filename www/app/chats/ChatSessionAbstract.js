(function(){
    angular.module("angFactories").factory('ChatSessionAbstract',
        ['notification', 'SpamFilter', 'timer', 'ScoreKeeper', 'user', 'socket',
    function(notification, SpamFilter, timer, ScoreKeeper, user, socket) {

        return function AbstractSession() {

            var self = this;
            this.extend = function(child) {
                angular.extend(child, this);
                self = child;
            };

            this.uuid = generateUuid();
            this.filter = new SpamFilter(this);
            this.isClosed = false;

            this.myScores = new ScoreKeeper('My scores', 1);
            this.partnerScores = new ScoreKeeper('Partner scores', 1);

            function generateUuid() {
                var u = Date.now().toString().substr(7);
                u += Math.round(Math.random()*100).toString();
                return btoa(u);
            }

            this.updateScores = function(scores) {
                Object.keys(scores).map(function(idx){
                    if (idx == self.chat.myIdx)
                        self.myScores.update(scores[idx]);
                    else
                        self.partnerScores.update(scores[idx]);
                });
            };

            this.incomeMessage = function(message){
                var text;

                if (message.type) {
                    // For debug:
                    if (message.type =='chat_finished')
                        text = '=== Собеседник покинул чат ===';
                    else if (message.type == 'chat_empty')
                        text = '=== Этот чат завершен ===';
                } else {
                    text = message;
                    notification.incomeMessage();
                }

                var msg = {
                    text: text,
                    isOwn: false
                };
                if (message.type) msg.type = message.type;
                this.addMessage(msg);

                logExternal({event: 'message',
                    channel: this.uuid,
                    payload: {sender_idx: 'he', text: text}});
            };

            this.myMessageSent = function(text) {
                this.addMessage({
                    text: text.sanitize(),
                    isOwn: true
                });

                logExternal({event: 'message',
                    channel: this.uuid,
                    payload: {sender_idx: 'me', text: text}});

                if (this.afterMyMessageSent) this.afterMyMessageSent();
            };

            this.conversationBegan = function() {
                logExternal({event: 'chat_ready', channel: this.uuid});
            };

            this.sessionFinished = function(byPartner) {
                if (this.isClosed) return;
                this.isClosed = true;

                user.save();
                timer.stop();

                logExternal({event: 'chat_empty',
                    channel: this.uuid,
                    payload: {sender_idx: byPartner ? 'he' : 'me'}});
            };

            this.addMessage = function(msg) {
                var skipSpamFilter;
                skipSpamFilter = msg.type == 'chat_empty' || this.type != 'external';
                if (!skipSpamFilter) this.filter.log(msg);

                this.messages.push(msg);
            };

            function logExternal(envelope) {
                if (this.type=='external') {
                    socket.emit('externalLog', envelope);
                }
            }
        }

    }]);

})();

