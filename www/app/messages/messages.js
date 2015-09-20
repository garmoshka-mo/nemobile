(function() {
        angular.module("angServices")
        .service('messages', ['$rootScope', 'apiRequest', 'deviceInfo', 'user', 'chats', 'routing', 'friendsList', '$state', 'notification',
            function($rootScope, apiRequest, deviceInfo, user, chats, routing, friendsList, $state, notification) {

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

                function showNotification(user, messageText, channelName, senderUuid) {
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
                        routing.goto('chat', {channelName: channelName});
                    });
                   
                }

                function handleIncomeMessage(message, envelope) {
                    log(message);
                    var self = user;
                    var channelName = envelope[3];

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


                    if (message.event == "chat_ready") {
                        $rootScope.$broadcast('new random chat', {type: 'internal', channel: channelName});
                        routing.goto('chat', {channelName: channelName, fromState: 'random'});
                        return;
                    }

                    var chat;
                    if (message.event == "chat_empty") {
                        chat = chats.getChat(channelName);
                        if (chat) {
                            chat.disconnect();
                            handleChatSessionAsync(chat, {type: 'chat_finished'}, 0);
                        }
                        return;
                    }

                    if (!message.pn_apns) {
                        console.warn('Unknown message format');
                        return;
                    }

                    //if previous ifs didn't work
                    //therefore message is user_message
                    var senderUuid = message.sender_uuid;
                    var messageText = message.pn_apns.message.sanitize();

                    var messageTimestamp = parseInt((+envelope[1]/10000).toFixed(0));

                    if (senderUuid == user.uuid) {
                        return;
                    }

                    //getting the last unexpired chat session
                    var lastSession;
                    
                    //checking if chat exist 
                    chat = chats.getChat(channelName, senderUuid);
                    if (chat) {
                        // log("added to existing chat");
                        
                        //if chat session exists 
                        if (!chat.isExpired) {
                            if (chat.lastMessageTimestamp >= messageTimestamp) {
                                return;
                            }
                            
                            if (!chat.lastUnexpiredChatSession) {
                                //it is necessary because some chat session is stored in 
                                //local memory and it takes time to get them from there
                                //that's why there is async handling 
                                handleChatSessionAsync(chat, messageText, message.expires);
                            }
                            else {
                                lastSession = chat.lastUnexpiredChatSession;
                            }
                        }
                        //if chat session exists but expired
                        else {
                            chat.addChatSession(senderUuid, channelName, senderUuid);
                            chat.getLastUnexpiredChatSession(); 
                            lastSession = chat.lastUnexpiredChatSession;
                        } 
                    }
                    else {
                        // log("created new chat");
                        chat = chats.addChat({channelName: channelName, senderId: senderUuid});
                        chat.addChatSession(senderUuid, channelName, senderUuid);
                        chat.getLastUnexpiredChatSession(); 
                        lastSession = chat.lastUnexpiredChatSession;
                    }

                    if (messageText === "$===real===") {
                        self.chats[senderUuid].isVirtual = false;
                        messageText = "<span class='text-bold'>пользователь зарегистрировался</span>";
                        // messageText = $sce.trustAsHtml(messageText);
                    }

                    if (lastSession) {
                        pushMessageToSession(lastSession, messageText, message.expires);
                    }

                    //filling sender uuid if it is undefined
                    if (senderUuid) {
                        if (!chat.senderId) {
                            chat.senderId = senderUuid;
                            chat.updateInfo(true);
                        } 
                    }

                    //filling channel name if it is undefined
                    if (!chat.channelName && channelName) {
                        chat.channelName = channelName;
                        $rootScope.$broadcast('got new channel name', {channelName: channelName});
                    }

                    //Ignoring these fields
                    //self.score = message.my_score;
                    //chat.senderScore = message.his_score;
                    chat.lastMessageTimestamp = messageTimestamp;
                    
                    //todo: check the correct work of self.lastMessageTimestamp
                    user.lastMessageTimestamp = new Date().getTime();
                    user.saveLastMessageTimestamp();

                    if (!($state.params.channelName == channelName || $state.params.senderId == senderUuid)) {
                        showNotification(user, messageText, channelName, senderUuid);
                        chat.isRead = false;
                        chats.countUnreadChats();
                    }
                    
                    chats.save();
                    
                    // log("When chatSession expires: ", lastSession.whenExipires);
                    // log("income message", m);
                    // log(self);
                    $rootScope.$apply();
                }

                $rootScope.$on('new message', function(event, args) {
                    handleIncomeMessage(args.message, args.envelope);
                });
            }
        ]);
    }

)();