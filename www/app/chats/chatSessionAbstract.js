(function(){
    factories.factory('chatSessionAbstract',
        ['notification', 'spamFilter',
    function(notification, spamFilter) {

        return function () {
            this.incomeMessage = function(message){
                var text;

                if (message.type =='chat_finished')
                    text = '<b>Собеседник покинул чат</b> <a href="#/random">Начать новый диалог</a>';
                else if (message.type == 'chat_empty')
                    text = '<b>Этот чат завершен</b> <a href="#/random">Начать новый диалог</a>';
                else {
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

            this.addMessage = function(msg) {
                var skip_spam_filter;
                skip_spam_filter = msg.type == 'chat_empty';
                if (!skip_spam_filter) spamFilter.filter(this, msg);
                this.messages.push(msg);
            };
        }

    }]);

})();

