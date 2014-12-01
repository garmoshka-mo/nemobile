angular.module("angServices", []).factory('api', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
    
    var pubnub = PUBNUB.init({
        subscribe_key: App.Settings.pubnubSubscribeKey
    })
    
    function toParams (obj) {
        var p = [];
        for (var key in obj) {
            p.push(key + '=' + obj[key]);
        }
        return p.join('&');
    };

    var chat = {
        messages:[],
        
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
                data: toParams({name: name, password: password})
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
                data: toParams({name: name, password: password})
            });
        },
        getUserInfo: function(access_token) {
            return $http({
                method: 'POST',
                url: App.Settings.apiUrl + '/profile',
                data: toParams({access_token: access_token})
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
        subscribe: function(channel) {
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
                    }
                    else {
                        console.log("created new chat")
                        var isSenderFriend = !!user.friends[m.sender_uuid];
                        user.chats[m.sender_uuid] = angular.extend({}, chat);
                        user.chats[m.sender_uuid].senderId = m.sender_uuid;
                        user.chats[m.sender_uuid].messages.push(
                            {
                                text: m.message_text,
                                isOwn: false
                            }
                        );
                    }
                    $rootScope.$apply();
                    console.log(m)
                    console.log($rootScope.user);
                }
            })
        },

        sendMessage: function(messageText, recepientId) {
            console.log(App.Settings.apiUrl);
            $http({
                method: 'POST',
                url: App.Settings.apiUrl + '/messages',
                data: toParams({
                    "access_token": $rootScope.user.accessToken,
                    "recepient_uuid": recepientId,
                    "message_text": messageText,
                    "ttl": 86400
                })
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
        }
    }
}])
