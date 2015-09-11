(function() {
        services
        .service('membership', ['$q', 'apiRequest', 'deviceInfo','user','routing',
            function($q, apiRequest, deviceInfo, user, routing) {

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
                    .then(function(response) {
                            ensureUserNeedsRegister(response.data)
                            if (response.data.active) {
                                deferred.resolve(response.data.score);
                            }
                            else {
                                deferred.reject();
                            }
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

                function ensureUserNeedsRegister(membership) {
                    var orderCreated = localStorage['orderCreated'] === 'true';
                    var registrationSkipped = localStorage['skipRegistration'] === 'true';
                    if (membership.active && user.isVirtual && orderCreated && !registrationSkipped) {
                        routing.goto('afterPurchase');
                    }
                };

                this.order = function (offerId) {
                    return apiRequest.send('POST', '/payment/orders', {offer_id: offerId}).then(function(){
                        localStorage.setItem('orderCreated', true);
                    });
                };

                this.getMembership = function () {
                    return apiRequest.send('GET', '/membership')
                        .then(function (res) {
                            if (res.data.success) {
                                return res.data;
                            }
                            else {
                                return $q.reject();
                            }
                        },
                        function () {
                            return $q.reject();
                        }
                    );
                };

                this.skipRegistration = function() {
                    localStorage.setItem('skipRegistration', true);
                    routing.goto('random');
                }
            }
        ]);
    }

)();