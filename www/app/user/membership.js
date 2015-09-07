(function() {
        services
        .service('membership', ['$q', 'apiRequest',
            function($q, apiRequest) {

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

            }
        ]);
    }

)();