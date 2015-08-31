(function(){
    factories.factory('SpamFilter',
        ['$resource',
function($resource) {

    var spamFilterHost = config('spamFilterHost');
    if (spamFilterHost) var rest = $resource(spamFilterHost);

    return function SpamFilter(session) {

        this.log = function(payload, callback) {
            if (_.isUndefined(rest)) return;

            var data = {
                client_id: user_uuid, // todo: replace to user.uuid after refactoring of user (right now creates circular dep)
                talk_id: session.uuid, // identification of session, can be used by async callback
                // to inform about malicious session
                timestamp_ms: Date.now(),
                payload: // Your data to analyze. Can have arbitrary format.
                    payload
            };
            rest.save(data, function(response) {
                if (callback) callback(response);
                else defaultHandler(response);
            });

            function defaultHandler(response) {
                if (response.risk_percent > 50) {
                    log('level50');
                    session.chat.disconnect();
                }
            }
        }

    };

}]);

})();

