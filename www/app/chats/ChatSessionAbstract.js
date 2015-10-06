(function(){
    angular.module("angFactories").factory('ChatSessionAbstract',
        ['notification', 'SpamFilter', 'timer', 'ScoreManager',
    function(notification, SpamFilter, timer, ScoreManager) {

        return function AbstractSession() {

            var myScores = new ScoreManager('My scores'),
                partnerScores = new ScoreManager('Partner scores');

            this.myScores = myScores;
            this.partnerScores = partnerScores;
            this.uuid = generateUuid();
            this.filter = new SpamFilter(this);

            function generateUuid() {
                var u = Date.now().toString().substr(7);
                u += Math.round(Math.random()*100).toString();
                return btoa(u);
            }

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

                partnerScores.myIncentive(text);
                myScores.partnerReacted();
            };

            this.myMessageSent = function(text) {
                this.addMessage({
                    text: text.sanitize(),
                    isOwn: true
                });

                myScores.myIncentive(text);
                partnerScores.partnerReacted();

                if (this.afterMyMessageSent) this.afterMyMessageSent();
            };

            this.sessionFinished = function(byPartner) {
                myScores.finished(byPartner);
                timer.stop();
            };

            this.addMessage = function(msg) {
                var skipSpamFilter;
                skipSpamFilter = msg.type == 'chat_empty' || this.type != 'external';
                if (!skipSpamFilter) this.filter.log(msg);

                this.messages.push(msg);
            };
        }

    }]);

})();

