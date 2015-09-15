(function() {
        services
        .service('pubnubSubscription', ['$rootScope', 'apiRequest', 'deviceInfo', 'user', '$q',
            function($rootScope, apiRequest, deviceInfo, user, $q) {

                var pubnub = PUBNUB.init({
                    subscribe_key: config('pubnubSubscribeKey'),
                    publish_key: "pub-c-d0b8d15b-ee39-4421-b5c9-cf6e4c8b3226"
                });

                function subscribeToChannelGroup() {
                    log('subscribed');
                    pubnub.subscribe({
                        channel_group: user.channel,
                        message: function(message, envelope, channelName) {
                            $rootScope.$broadcast('new message', {
                                message: message,
                                envelope: envelope,
                                channelName: channelName
                            });
                        }
                    });
                }

                function onParseUserInfo() {
                    getUnseenMessages();
                    subscribeToChannelGroup();
                    registerDeviceToChannel();
                }

                function onUserLogIn() {
                    subscribeToChannelGroup();
                    registerDeviceToChannel();
                }

                $rootScope.$on('user data parsed', onParseUserInfo);        
                $rootScope.$on('user logged in', onUserLogIn);

                function unsubscribe(channelGroup) {
                    pubnub.unsubscribe({
                        channel_group: channelGroup
                    });
                }

                $rootScope.$on('user logged out', function(event, args) {
                    unsubscribe(args.user);
                    removeDeviceFromChannel();
                });

                function getChannelHistory(channel) {
                    var d = $q.defer();

                    var MSEC_IN_MONTH = 30 * 24 * 3600 * 1000;
                    
                    var end;
                    if (user.lastMessageTimestamp) {
                        end = user.lastMessageTimestamp * 10000;
                    }
                    else {
                        end = MSEC_IN_MONTH * 1000; 
                    }

                    pubnub.history(
                        {
                            channel: channel,
                            end: end,
                            callback: function(res) {
                                log("unseen messages: ", res);
                                d.resolve(res);
                            },
                            include_token: true 
                        }
                    );

                    return d.promise;
                }

                function getGroupChannels() {
                    var d = $q.defer();
                    
                    pubnub.channel_group_list_channels({
                        channel_group: user.channel,
                        callback: function(res) {
                            d.resolve(res.channels);
                        }
                    });

                    return d.promise;
                }

                function handleChannelHistory(messages, channel) {
                    
                    for (var j = 0; j < messages.length; j++) {
                        $rootScope.$broadcast('new message', {
                            message: messages[j].message,
                            envelope: [null, messages[j].timetoken, null, channel]
                        });
                    }

                    if (window.goToLastMessageChat) {
                        location.href = "#/chat?senderId=" + messages[messages.length - 1].sender_uuid;
                    }

                    log('while you were away', messages);
                    
                    window.isGotUnseenMessage = true;
                }

                function getUnseenMessages() {
                    var d = $q.defer();
                    
                    if (user.lastMessageTimestamp || user.isVirtual) {
                        // log("last seen message timestamp * 10000: ",
                        //     (user.lastMessageTimestamp * 10000).toString());
                        
                        getGroupChannels()
                        .then(
                            function(channels) {
                                var channelsHistoriesPromises = [];

                                // log('channels were got', channels);
                                
                                var _promise = channels.forEach(function(channel) {
                                    getChannelHistory(channel)
                                    .then(
                                        function(res) {

                                            handleChannelHistory(res[0], channel);
                                        }
                                    );
                                    channelsHistoriesPromises.push(_promise);
                                });

                                return channelsHistoriesPromises;
                            }
                        )
                        .then(function(historiesPromises) {
                            $q.all(historiesPromises)
                            .then(function(res) {
                                d.resolve();
                            });
                        });
                    }
                    else {
                        d.reject();
                    }

                    return d.promise;
                }

                function registerDeviceToChannel(channel) {
                    if (window.deviceId) {
                        var type = device.platform === "iOS" ? "apns" : "gcm";
                       
                        pubnub.mobile_gw_provision ({
                            device_id: window.deviceId,
                            op: 'add',
                            gw_type: type,
                            channel: channel,
                            callback: function(res) {
                                log("device was registered channel", res);
                            },
                            error: function(res) {
                                log("register device error", res);
                            }
                        });
                        
                    }
                    else {
                        if (RAN_AS_APP) console.warn("device id is undefined");
                    }     
                }

                $rootScope.$on('got new channel name', function(event, args) {
                    registerDeviceToChannel(args.channelName);
                });

                function removeDeviceFromChannel(channel) {
                    if (window.deviceId) {
                        // if channel is defined remove only from
                        // this channel else remove from all channels
                        if (channel) {
                            pubnub.mobile_gw_provision ({
                                device_id: window.deviceId,
                                op: 'remove',
                                gw_type: type,
                                channel: channel,
                                callback: function(res) {
                                    log("device was unregistered from", res);
                                },
                                error: function(res) {
                                    log("unregister device error", res);
                                }
                            });
                        }
                        else {
                            var type = device.platform === "iOS" ? "apns" : "gcm";
                            var url = "http://pubsub.pubnub.com/v1/push/sub-key/"
                                + config('pubnubSubscribeKey')  + "/devices/"
                                + window.deviceId + "/remove?type=" + type;
                            $http.get(url).then(
                                function(res) {
                                    log(res);
                                },
                                function(res) {
                                    log(res);
                                }
                            );
                        }
                    }
                }

                $rootScope.$on('chat removed', function(event, args) {
                    if (args.chat.channelName) {
                        removeDeviceFromChannel(args.chat.channelName);
                    }
                });

            }
        ]);
    }

)();