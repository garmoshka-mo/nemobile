services
.factory('api', ['$http', '$q', '$rootScope', 'notification', 'objects','storage', function ($http, $q, $rootScope, notification, objects, storage) {
    // $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
    console.log("api service is enabled");
    
    var pubnub = PUBNUB.init({
        subscribe_key: App.Settings.pubnubSubscribeKey
    })
    
    function handleOsNotificationClick (params) {
        location.href = params.href;
    }

    function showNotification(user, message) {
        var notificationText;
        var m = message;
        
        if (user.friends[m.sender_uuid]) {
            notificationText = user.friends[m.sender_uuid].name;    
        }
        else {
            notificationText = "Новое сообщение";
        }

        if ($rootScope.isAppInBackground) {
            notification.setOSNotification(m.message_text, notificationText, {"href": "#/chat/" + m.sender_uuid},
            handleOsNotificationClick);
        }
        else {
            notification.setTemporary(notificationText + ": " + m.message_text, 4000, function() {
                location.href = "#/chat/" + m.sender_uuid;
            })
        }
    }

    return {
        signin: function(name, password) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + '/login',
                data: {name: name, password: password}
            })
            .then(function(res) {
                if (res.data.success) {
                    return {accessToken: res.data.access_token};
                }
                else {
                    return $q.reject({errorDescription: res.data.error[1]})
                }
            });
        },

        signup: function(name, password) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + '/register',
                data: {name: name, password: password}
            })
            .then(function(res) {
                console.log(res);
                if (res.data.success) {
                    return true;
                }
                else {
                    return $q.reject({errorDescription: res.data.error})
                }
            })

        },
        getUserInfo: function(access_token) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + '/profile',
                data: {access_token: access_token}
            })
            .then(function(res) {
                if (res.data.success) {
                    return res.data.user;
                }
                else {
                    return $q.reject();
                }
            })
        },
        getServerTime: function() {
            return $http({
                method: 'GET',
                url: App.Settings.apiUrl + '//time?access_token=' + $rootScope.user.accessToken ,
            })
            .then(
                function(res) {
                    return res.data.origin_time;
                },
                function(res) {
                    return $q.reject();
                }
            )
        },
        addNewChat: function(senderId) {
            var user = $rootScope.user;
            user.chats[senderId] = angular.extend({}, objects.chat);
            user.chats[senderId].chatSessions = {};
            user.chats[senderId].senderId = senderId;
            storage.saveChats();
        },
        addNewFriend: function(friendUuid, name) {
            var user = $rootScope.user;
            $rootScope.user.friends[friendUuid] = {name: name};
            storage.saveFriends();
        },
        addNewChatSession: function(senderId, expires) {
            var _chatSession = angular.extend({}, objects.chatSession)
            var currentChat =  $rootScope.user.chats[senderId];
            var lastChatSessionIndex = currentChat.lastChatSessionIndex;

            _chatSession.messages = [];
            _chatSession.whenExpires = new Date(expires).getTime();
            _chatSession.isReplied = false;
            _chatSession.expired = false;

            if (lastChatSessionIndex) {
                var newIndex = lastChatSessionIndex + 1;
                _chatSession.id = newIndex;
                currentChat.lastChatSessionIndex = newIndex;
                currentChat.chatSessionsIndexes.push(newIndex);
                currentChat.chatSession[newIndex] = _chatSession;
            }
            else {
                console.log("first chatSession in chat is created")
                _chatSession.id = 0;
                currentChat.lastChatSessionIndex = 0;
                currentChat.chatSessionsIndexes = [];
                currentChat.chatSessionsIndexes.push(0);
                currentChat.chatSessions["0"] = _chatSession;
            }

            console.log("user after adding new chatSeesion");
            console.log($rootScope.user);
            storage.saveChats();
            
            
        },
        subscribe: function(channel) {
            var self = this;
            pubnub.subscribe({
                channel: channel,
                message: function handleMessage(m) {
                    console.log(m);
                    var user = $rootScope.user;
                    
                    if (user.chats[m.sender_uuid]) {
                        console.log("add to existing chat")
                        user.chats[m.sender_uuid].getLastUnexpiredChatSession(); 
                        var lastSession = user.chats[m.sender_uuid].lastChatSession; 
                        
                        if (!lastSession) {
                            self.addNewChatSession(m.sender_uuid, m.expires);
                            user.chats[m.sender_uuid].getLastUnexpiredChatSession(); 
                            lastSession = user.chats[m.sender_uuid].lastChatSession;
                            lastSession.creatorId = m.sender_uuid; 
                        }

                        if (!lastSession.isReplied) {
                            if (lastSession.creatorId == $rootScope.user.uuid)
                            lastSession.isReplied = true;
                        }

                        lastSession.messages.push({
                            text: m.message_text,
                            isOwn: false
                        });
                        // lastSession.isReplied = lastSession.messages.length > 1 ? true : false;
                    }
                    else {
                        console.log("created new chat")
                        self.addNewChat(m.sender_uuid)
                        self.addNewChatSession(m.sender_uuid, m.expires)
                        user.chats[m.sender_uuid].getLastUnexpiredChatSession(); 
                        var lastSession = user.chats[m.sender_uuid].lastChatSession;
                        lastSession.creatorId = m.sender_uuid;
                        lastSession.messages.push(
                            {
                                text: m.message_text,
                                isOwn: false
                            }
                        );
                    }
                    storage.saveChatSession(lastSession, m.sender_uuid);
                    showNotification(user, m);
                    
                    self.getServerTime()
                    .then(function(time) {
                        console.log(time);
                        console.log("time to live: " + (new Date(m.expires).getTime() - time * 1000));
                    })
                    $rootScope.$apply();
                    console.log(m)
                    console.log("user:")
                    console.log($rootScope.user);
                }
            })
        },
        unsubscribe:function() {
            pubnub.unsubscribe(
            {
                channel: $rootScope.user.channel
            })
        },
        sendMessage: function(messageText, recepientId, ttl) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + '/messages',
                data: {
                    "access_token": $rootScope.user.accessToken,
                    "recepient_uuid": recepientId,
                    "message_text": messageText,
                    "ttl": 86400
                }
            })
            .then(
                function(res) {
                    console.log("message is sent");
                    console.log(res)
                    if (res.data.success && !res.data.type) {
                        return true;
                    }
                    else {
                        return $q.reject(res.data.type);
                    }
                },
                function(res) {
                    console.log(res)
                }
            )
        },

        getUnseenMessages: function() {
                pubnub.history(
                    {
                        channel: $rootScope.user.channel,
                        callback: function(m) {
                            console.log(m);
                        }
                    }
                );
        },

        searchUser: function(userName) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + '/users/search',
                data: {
                    "access_token": $rootScope.user.accessToken,
                    "search_params": [{name: userName}]
                }
            })
            .then(
                function(res) {
                    if (res.data.success) {
                        return res.data;
                    }
                    else {
                        return $q.reject();
                    }
                },
                function(res) {
                    return $q.reject();;
                }
            )
        }
    }
}])
