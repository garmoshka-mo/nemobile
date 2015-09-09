(function() {
        services
        .service('membership', ['$q', 'apiRequest', 'deviceInfo',
            function($q, apiRequest, deviceInfo) {

                function getPlatform() {
                    if (RAN_AS_APP) {
                        return deviceInfo.isIos ? 'ios' : 'android';
                    }
                    else {
                        return 'web';
                    }
                }

                this.getLevel = function() {
                    var deferred = $q.defer();

                    // todo: replace to injection of user after refactoring:
                    if (!user_uuid) return $q.when(10);

                    apiRequest.send('GET', '/membership')
                    .then(function(r) {
                        if (r.data.active)
                            deferred.resolve(r.data.score);
                        else
                            deferred.reject();
                    });

                    return deferred.promise;
                };

                this.getOffers = function() {
                    return apiRequest.send('GET', '/payment/offers/' + getPlatform())
                    .then(
                        function(res) {
                            if (res.data.success) {
                                return res.data;
                            }
                            else {
                                return $q.reject();
                            }
                        },
                        function() {
                            return $q.reject();
                        }

                    );
                };

                this.order = function (offerId) {
                    return apiRequest.send('POST', '/payment/orders', {offer_id: offerId});    
                };

            }
        ]);
    }

)();