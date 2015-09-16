(function(){
    factories.factory('ChatSessionAbstract',
        ['notification', 'SpamFilter', 'timer',
    function(notification, SpamFilter, timer) {

        return function AbstractSession() {
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
            };

            this.sessionFinished = function() {
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

