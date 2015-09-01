(function(){
    factories.factory('SpamFilter',
        ['$resource', '$q',
function($resource, $q) {

    var spamFilterHost = config('spamFilterHost');
    if (spamFilterHost) var rest = $resource(spamFilterHost);

    return function SpamFilter(session) {

        this.log = function(payload) {

            if (_.isUndefined(rest)) {
                var deferred = $q.defer();
                deferred.reject();
                return deferred.promise;
            }

            var data = {
                client_id: user_uuid, // todo: replace to user.uuid after refactoring of user (right now creates circular dep)
                talk_id: session.uuid, // identification of session, can be used by async callback
                // to inform about malicious session
                timestamp_ms: Date.now(),
                payload: // Your data to analyze. Can have arbitrary format.
                    payload
            };

            return rest.save(data).$promise;

        }

    };

}]);

})();

