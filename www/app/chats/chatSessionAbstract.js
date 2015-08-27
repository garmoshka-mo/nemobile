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

            this.intro = function(msg) {
                spamFilter.filter(this, msg);
                // Maybe add intro handling...
            }

        }

    }]);

    factories.service('spamFilter',
        ['$resource',
    function($resource) {

        var spam_filter_host = config('spamFilterHost');
        if (spam_filter_host) var spamFilter = $resource(spam_filter_host);

        this.filter = function(session, payload) {
            if (_.isUndefined(spamFilter)) return;

            var data = {
                session_id: session.id, // identification of session, can be used by async callback
                // to inform about malicious session
                timestamp_ms: Date.now(),
                payload: // Your data to analyze. Can have arbitrary format.
                    payload
            };
            spamFilter.save(data, function(response) {
                if (response.risk_percent > 50)
                    session.chat.disconnect();
            })
        }

    }]);

})();

