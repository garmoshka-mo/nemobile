(function() {
angular.module("angServices")
.service('messages',
    ['$rootScope', 'socket',  'random', 'chats', 'user',
function($rootScope, socket, random, chats, user) {

    socket.on('chat_ready', function(envelope) {
        if (random.isSearching()) {
            chats.newRandomInternal(envelope.channel, envelope.my_idx);

            $rootScope.$broadcast('new random chat',
                {type: 'internal', channel: envelope.channel});
        }
    });

    socket.on('chat_empty', function(envelope) {
        getChatAndDoScores(envelope, function(chat) {
            chat.disconnect(true);
            chat.sendMessage({type: 'chat_finished'});
        });
    });

    socket.on('message', function(envelope){
        getChatAndDoScores(envelope, function(chat) {
            chat.processIncomePayload(envelope.payload);
        });
    });

    socket.on('scores', function(envelope){
        getChatAndDoScores(envelope);
    });

    socket.on('honor', function(scores){
        user.honor.update(scores);
    });

    function getChatAndDoScores(envelope, callback) {
        var channel = envelope.channel;

        // Пока что работаем только с текущим чатом.
        // todo: при параллельных чатах - правильно организовать сохранение, см. гугл-док "Параллельные чаты"
        if (channel != chats.current.channel) return;

        var chat = chats.getChat(channel);
        if (!chat)
            return console.warn('Received message to non-existing chat', channel, envelope);

        if (envelope.payload.scores)
            chat.processScores(envelope.payload.scores);

        if (callback) callback(chat);
    }

}]);
})();