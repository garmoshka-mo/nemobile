(function(){
    factories.factory('chatSessionAbstract',
        ['notification', '$resource',
    function(notification, $resource) {

        var VersionResource = $resource(config('spam_filter_host')+'/version');


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

                var m = {
                    text: text,
                    isOwn: false
                };
                this.spam_filter(this.id, m);
                this.messages.push(m);
            };

            this.spam_filter = function(session_id, payload) {
                var data = {
                    session_id: 1, // identification of session, can be used by async callback
                                   // to inform about malicious session
                    timestamp_ms: Date.now(),
                    payload: // Your data to analyze. Can have arbitrary format.
                        payload
                };

            }
        }

    }]);
})();

