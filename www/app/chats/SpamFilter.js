(function(){
    factories.factory('SpamFilter',
        ['$resource', '$q', 'user',
function($resource, $q, user) { 

    var spamFilterHost = config('spamFilterHost');
    if (spamFilterHost) var rest = $resource(spamFilterHost);

    return function SpamFilter(session) {

        this.log = function(payload, talk_params) {

            if (_.isUndefined(rest)) {
                var deferred = $q.defer();
                deferred.reject();
                return deferred.promise;
            }

            var data = {
                client_id: user.uuid, // todo: replace to user.safe_id after refactoring of user (right now creates circular dep)
                talk_id: session.uuid, // identification of session, can be used by async callback
                // to inform about malicious session
                timestamp_ms: Date.now(),
                payload: // Your data to analyze. Can have arbitrary format.
                    payload
            };
            if (talk_params) data.talk_params = talk_params;

            return rest.save(data).$promise;

        }

    };

}]);

})();

