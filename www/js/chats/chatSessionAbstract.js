(function(){
    factories.factory('chatSessionAbstract',
        ['notification',
    function(notification) {

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

                this.messages.push({
                    text: text,
                    isOwn: false
                });
            };
        }

    }]);
})();