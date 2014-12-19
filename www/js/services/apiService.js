services
.factory('api', ['$http', '$q', '$rootScope', 'notification','storage', 'Chat',
    function ($http, $q, $rootScope, notification, storage, Chat) {
    // $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
    console.log("api service is enabled");
    
    var pubnub = PUBNUB.init({
        subscribe_key: App.Settings.pubnubSubscribeKey
    })
    
    function handleOsNotificationClick (params) {
        location.href = params.href;
    }

    var deviceServerTimeDifference_msec;

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

    function calculateMessageTtl(message) {
        var currentServerTime = new Date().getTime() + deviceServerTimeDifference_msec;
        var ttl = message.expires * 1000 - currentServerTime;
        console.log("time to live(sec): " +  ttl / 1000);
        return ttl;
    }

    var api = {
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

        getTimeDifference: function() {
            return api.getServerTime()
            .then(function(time) {
                deviceServerTimeDifference_msec = time * 1000 - new Date().getTime();
                console.log(deviceServerTimeDifference_msec);
            })
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
                        var lastSession;
                        
                        if (!user.chats[m.sender_uuid].isExpired) {
                            lastSession = user.chats[m.sender_uuid].lastUnexpiredChatSession;
                        }
                        else {
                            lastSession = null;
                        } 
                        
                        if (!lastSession) {
                            user.chats[m.sender_uuid].addChatSession(m.sender_uuid, m.sender_uuid);
                            user.chats[m.sender_uuid].getLastUnexpiredChatSession(); 
                            lastSession = user.chats[m.sender_uuid].lastUnexpiredChatSession;
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
                        user.addChat(m.sender_uuid)
                        user.chats[m.sender_uuid].addChatSession(m.sender_uuid, m.sender_uuid)
                        user.chats[m.sender_uuid].getLastUnexpiredChatSession(); 
                        var lastSession = user.chats[m.sender_uuid].lastUnexpiredChatSession;
                        lastSession.messages.push(
                            {
                                text: m.message_text,
                                isOwn: false
                            }
                        );
                    }
                    storage.saveChatSession(lastSession, m.sender_uuid);
                    showNotification(user, m);

                    var ttl;
                    if (deviceServerTimeDifference_msec) {
                        ttl = calculateMessageTtl(m);
                        lastSession.setTimer(ttl);
                        lastSession.whenExipires = new Date().getTime() + ttl;                  
                    }
                    else {
                        api.getTimeDifference()
                        .then(function() {
                            ttl = calculateMessageTtl(m);
                            lastSession.setTimer(ttl);
                            lastSession.whenExipires = new Date().getTime() + ttl;                  
                        })
                    }
                    console.log("When chatSession expires: " + lastSession.whenExipires);
                    $rootScope.$apply();
                    console.log(m)
                    console.log($rootScope.user);
                }
            })
        },

        unsubscribe:function() {
            pubnub.unsubscribe({
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
                    "ttl": ttl
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



    return api;
}])
