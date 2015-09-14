(function() {
        services
        .service('pubnubSuscription', ['$rootScope', 'apiRequest', 'deviceInfo', 'user',
            function($rootScope, apiRequest, deviceInfo, user) {

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

                $rootScope.$on('user data parsed', subscribeToChannelGroup);        
                $rootScope.$on('user logged in', subscribeToChannelGroup);

                function unsubscribe(channelGroup) {
                    pubnub.unsubscribe({
                        channel_group: channelGroup
                    });
                }

                $rootScope.$on('user logged out', function(event, args) {
                    unsubscribe(args.user);
                });        
            }
        ]);
    }

)();