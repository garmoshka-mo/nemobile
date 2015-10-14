(function() {
angular.module("angServices")
.service('messages',
    ['$rootScope', 'socket',  'random', 'chats', 'user', 'Avatar', 'Partner',
function($rootScope, socket, random, chats, user, Avatar, Partner) {

    socket.on('chat_ready', function(envelope) {
        if (random.isSearching()) {
            chats.newRandomInternal(envelope.channel, envelope.my_idx, makePartner(envelope));

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

    function makePartner(envelope) {
        var partnerProfile;
        for (var profileId in envelope.payload.profiles) {
            if (profileId !== envelope.my_idx) {
                partnerProfile = envelope.payload.profiles[profileId];
                break;
            }
        }
        var avatar = new Avatar(partnerProfile);
        var partnerData = {
            avatar: avatar
        };
        return new Partner(partnerData);
    }

    function getChatAndDoScores(envelope, callback) {
        var channel = envelope.channel;

        // Пока что работаем только с текущим чатом.
        // todo: при параллельных чатах - правильно организовать сохранение, см. гугл-док "Параллельные чаты"
        if (!chats.current || channel != chats.current.channel) return;

        if (envelope.payload.scores)
            chats.current.processScores(envelope.payload.scores);

        if (callback) callback(chats.current);
    }

}]);
})();