(function() {
angular.module("angServices")
.service('messages',
    ['$rootScope', 'deviceInfo', 'socket',  'random',
        'user', 'chats', 'router', 'friendsList', 'notification',
function($rootScope, deviceInfo, socket, random,
         user, chats, router, friendsList, notification) {

    socket.on('chat_ready', function(envelope) {
        if (random.isSearching())
            $rootScope.$broadcast('new random chat',
                {type: 'internal', channel: envelope.channel});
    });

    socket.on('chat_empty', function(envelope) {
        var current =  chats.current;
        if (current.channel == envelope.channel) {
            current.disconnect(true);
            handleChatSessionAsync(current, {type: 'chat_finished'}, 0);
        }
    });


    socket.on('message', function(envelope){
        var senderUuid = envelope.payload.sender_uuid,
            messageText = envelope.payload.text.sanitize(),
            channel = envelope.channel;

        //var messageTimestamp = parseInt((+envelope[1]/10000).toFixed(0));

        if (senderUuid == user.uuid) return;

        // Пока что работаем только с текущим чатом.
        // todo: при параллельных чатах - правильно организовать сохранение, см. гугл-док "Параллельные чаты"
        if (channel != chats.current.channel) return;

        //getting the last unexpired chat session
        var lastSession;

        //checking if chat exist
        var chat = chats.getChat(channel, senderUuid);
        if (chat) {
            // log("added to existing chat");

            //if chat session exists
            if (!chat.isExpired) {
                //if (chat.lastMessageTimestamp >= messageTimestamp)
                //    return;

                if (!chat.lastUnexpiredChatSession) {
                    //it is necessary because some chat session is stored in
                    //local memory and it takes time to get them from there
                    //that's why there is async handling
                    handleChatSessionAsync(chat, messageText, envelope.payload.expires);
                }
                else {
                    lastSession = chat.lastUnexpiredChatSession;
                }
            }
            //if chat session exists but expired
            else {
                chat.addChatSession(senderUuid, channel, senderUuid);
                chat.getLastUnexpiredChatSession();
                lastSession = chat.lastUnexpiredChatSession;
            }
        }
        else {
            // log("created new chat");
            chat = chats.addChat({channel: channel, senderId: senderUuid});
            chat.addChatSession(senderUuid, channel, senderUuid);
            chat.getLastUnexpiredChatSession();
            lastSession = chat.lastUnexpiredChatSession;
        }


        if (lastSession) {
            pushMessageToSession(lastSession, messageText, envelope.payload.expires);
        }

        //filling sender uuid if it is undefined
        if (senderUuid) {
            if (!chat.senderId) {
                chat.senderId = senderUuid;
                chat.updateInfo(true);
            }
        }

        //filling channel name if it is undefined
        if (!chat.channel && channel) {
            chat.channel = channel;
            $rootScope.$broadcast('got new channel name', {channel: channel});
        }

        //Ignoring these fields
        //self.score = message.my_score;
        //chat.senderScore = message.his_score;

        //chat.lastMessageTimestamp = messageTimestamp;
        chat.lastMessageTimestamp = new Date().getTime();

        //todo: check the correct work of self.lastMessageTimestamp
        user.lastMessageTimestamp = new Date().getTime();
        user.saveLastMessageTimestamp();

        if (chats.current.channel != channel) {
            showNotification(user, messageText, channel, senderUuid);
            chat.isRead = false;
            chats.countUnreadChats();
        }

        chats.save();

        // log("When chatSession expires: ", lastSession.whenExipires);
        // log("income message", m);
        // log(self);
        $rootScope.$apply();
    });



    function pushMessageToSession(lastSession, messageText, expires) {
        lastSession.incomeMessage(messageText);

        if (!lastSession.isReplied) {
            if (lastSession.creatorId === self.uuid) {
                lastSession.setReplied();
            }
        }

        // todo: fix logic bugs and uncomment
        //lastSession.setTimer(expires);

        lastSession.save();
    }

    function handleChatSessionAsync(chat, messageText, expires) {
        log('handle chat session async');
        chat.getLastUnexpiredChatSession()
        .then(
            function(lastSession) {
                pushMessageToSession(lastSession, messageText, expires);
            }
        );
    }

    function showNotification(user, messageText, channel, senderUuid) {
        var notificationText;

        if (friendsList.nepotomFriends[senderUuid]) {
            var friend = friendsList.nepotomFriends[senderUuid];
            var imgSrc = friend.photos[0].valueMini ? friend.photos[0].valueMini :
                friend.photos[0].value;
            var image = "<img src='" + imgSrc +
                "' class='chat-toolbar-image pointer'>";
            notificationText = image + friend.displayName;
        }
        else {
            notificationText = "Новое сообщение";
        }


        notification.setTemporary(notificationText + ": " + messageText, 4000, function() {
            router.goto('chat', {channel: channel});
        });

    }

    function handleIncomeMessage(message, envelope) {
        log(message);
        var self = user;
        var channel = envelope[3];

        // todo: move to sockets
        if (message.event == "contacts_updated") {
            log('friends list will be updated');
            // getUserFriendsFromServer();
            return;
        }

        if (message.event == "profile_updated") {
            log('user info will be updated');
            user.updateUserInfo(user.accessToken);
            return;
        }


        //if previous ifs didn't work
        //therefore message is user_message


        // todo: refactor to events
        if (messageText === "$===real===") {
            self.chats[senderUuid].isVirtual = false;
            messageText = "<span class='text-bold'>пользователь зарегистрировался</span>";
            // messageText = $sce.trustAsHtml(messageText);
        }

    }
}]);
})();