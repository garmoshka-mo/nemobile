services
.factory('api', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
    // $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
    console.log("api service is enabled");
    var pubnub = PUBNUB.init({
        subscribe_key: App.Settings.pubnubSubscribeKey
    })
    
    var chat = {
        getLastMessage: function() {
            if (this.messages.length) {
                var messagesAmount = this.messages.length;
                return this.messages[messagesAmount - 1].text;
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
        addNewChat: function(senderId) {
            var user = $rootScope.user;
            user.chats[senderId] = angular.extend({}, chat);
            user.chats[senderId].messages = [];
            user.chats[senderId].senderId = senderId;
        },
        addNewFriend: function(friendUuid, name) {
            var user = $rootScope.user;
            $rootScope.user.friends[friendUuid] = {name: name}
        },
        subscribe: function(channel) {
            var self = this;
            pubnub.subscribe({
                channel: channel,
                message: function(m) {
                    var user = $rootScope.user;

                    if (user.chats[m.sender_uuid]) {
                        console.log("added to old chat")
                        user.chats[m.sender_uuid].messages.push({
                            text: m.message_text,
                            isOwn: false
                        });
                        user.chats[m.sender_uuid].lastMessageTimestamp = new Date().getTime();
                    }
                    else {
                        console.log("created new chat")
                        self.addNewChat(m.sender_uuid)
                        user.chats[m.sender_uuid].messages.push(
                            {
                                text: m.message_text,
                                isOwn: false
                            }
                        );
                        $rootScope.notification = m.message_text;
                        user.chats[m.sender_uuid].lastMessageTimestamp = new Date().getTime();
                    }
                    $rootScope.$apply();
                    console.log(m)
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
        sendMessage: function(messageText, recepientId) {
            console.log(App.Settings.apiUrl);
            $http({
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
                    console.log(res)
                    if (res.data.success) {
                        return true;
                    }
                    else {
                        return $q.reject();
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
