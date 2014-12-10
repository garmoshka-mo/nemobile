services
.factory('api', ['$http', '$q', '$rootScope', 'notification', function ($http, $q, $rootScope, notification) {
    // $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
    console.log("api service is enabled");
    
    var pubnub = PUBNUB.init({
        subscribe_key: App.Settings.pubnubSubscribeKey
    })

    
    var chat = {
        senderId: null,
        
        getLastUnexpiredChatSession: function() {
            for (var i = 0; i < this.chatSessions.length; i++) {
                if (!this.chatSessions[i].expired) {
                    return this.chatSessions[i]
                }
                else {
                    return false
                }
            }
        },

        getChatTitle: function() {
            if ($rootScope.user.friends[this.senderId]) {
                return $rootScope.user.friends[this.senderId].name;
            }
            else {
                return this.senderId;
            }
        }
    }

    var chatSession = {
        isReplied: false,
        expired: false,
        whenExpires: null,

        getLastMessage: function() {
            if (this.messages.length) {
                var messagesAmount = this.messages.length;
                return this.messages[messagesAmount - 1].text;
            }
        },
    }

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
        getPubnubTime: function() {
            var deferred = $q.defer();
            pubnub.time(function(time) {
                deferred.resolve(time)
            })
            return deferred.promise;
        },
        addNewChat: function(senderId) {
            var user = $rootScope.user;
            user.chats[senderId] = angular.extend({}, chat);
            user.chats[senderId].chatSessions = [];
            user.chats[senderId].senderId = senderId;
        },
        addNewFriend: function(friendUuid, name) {
            var user = $rootScope.user;
            $rootScope.user.friends[friendUuid] = {name: name}
        },
        addNewChatSession: function(senderId, expires) {
            var _chatSession = angular.extend({}, chatSession)
            _chatSession.messages = [];
            _chatSession.whenExpires = new Date(expires).getTime();
            _chatSession.isReplied = false;
            _chatSession.expired = false;
            $rootScope.user.chats[senderId].chatSessions.push(_chatSession);
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
                        var lastSession = user.chats[m.sender_uuid].getLastUnexpiredChatSession(); 
                        
                        if (!lastSession) {
                            self.addNewChatSession(m.sender_uuid, m.expires);
                            lastSession = user.chats[m.sender_uuid].getLastUnexpiredChatSession();
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
                        var lastSession = user.chats[m.sender_uuid].getLastUnexpiredChatSession();
                        lastSession.creatorId = m.sender_uuid;
                        lastSession.messages.push(
                            {
                                text: m.message_text,
                                isOwn: false
                            }
                        );
                    }

                    showNotification(user, m);
                    
                    self.getPubnubTime()
                    .then(function(time) {
                        console.log("time to live: " + (new Date(m.expires).getTime() - time / 10000));
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

        getUserFromLS: function(uuid) {
            var user = JSON.parse(window.localStorage.getItem(uuid));
            if (user) {
                for (_chat in user.chats) {
                    user.chats[_chat] = angular.extend(user.chats[_chat], chat);
                }
            }
            return user;
        },

        saveUserInLS: function() {
            window.localStorage.setItem($rootScope.user.uuid, JSON.stringify($rootScope.user))
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
