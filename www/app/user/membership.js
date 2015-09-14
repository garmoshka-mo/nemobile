(function() {
        services
        .service('membership', ['$q', 'apiRequest', 'deviceInfo', 'user',
            function($q, apiRequest, deviceInfo, user) {

                function getPlatform() {
                    if (RAN_AS_APP) {
                        return deviceInfo.isIos ? 'ios' : 'android';
                    }
                    else {
                        return 'web';
                    }
                }

                this.getScore = function() {
                    var deferred = $q.defer();

                    if (!user.uuid) {
                        user.score = 10;
                        return $q.when(10);
                    }

                    apiRequest.send('GET', '/membership')
                    .then(function(result) {
                        if (result.active) {
                            user.score = result.score;
                            deferred.resolve(result.score);
                        }
                        else {
                            deferred.reject();
                        }
                    });

                    return deferred.promise;
                };

                this.getOffers = function() {
                    return apiRequest.send('GET', '/payment/offers/' + getPlatform());
                };

                this.order = function (offerId) {
                    return apiRequest.send('POST', '/payment/orders', {offer_id: offerId});    
                };

            }
        ]);
    }

)();