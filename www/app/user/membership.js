(function() {
        services
        .service('membership', ['$q', 'apiRequest', 'deviceInfo', 'user', 'routing',
            function($q, apiRequest, deviceInfo, user, routing) {

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
                    .then(function(res) {
                            ensureUserNeedsToRegister(res);
                            if (res.active) {
                                user.score = res.score;
                                deferred.resolve(res.score);
                            }
                            else {
                                deferred.reject();
                            }
                    });

                    return deferred.promise;
                };

                this.getOffers = function() {
                    //platform dependent offers ('GET', '/payment/offers/' + getPlatform());
                    return apiRequest.send('GET', '/payment/offers/').then(function (data) {
                        return data.offers;
                    });
                };

                function ensureUserNeedsToRegister(membership) {
                    var orderCreated = localStorage['orderCreated'] === 'true';
                    var registrationSkipped = localStorage['skipRegistration'] === 'true';
                    if (membership.active && user.isVirtual && orderCreated && !registrationSkipped) {
                        routing.goto('afterPurchase');
                    }
                }

                this.ensureUserNeedsToRegister = function() {
                    this.getMembership().then(function(membership) {
                        ensureUserNeedsToRegister(membership)
                    })
                };

                this.order = function (offerId) {
                    return apiRequest.send('POST', '/payment/orders', {offer_id: offerId}).then(function(data){
                        localStorage.setItem('orderCreated', true);
                        if (RAN_AS_APP) {
                            navigator.app.loadUrl(data.url, {openExternal: true});
                        }
                        else {
                            window.open(data.url, '_self', false);
                        }
                    });
                };

                this.getMembership = function () {
                    return apiRequest.send('GET', '/membership')
                        .then(function (res) {
                            if (res.success) {
                                return res;
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
                }
            }
        ]);
    }

)();