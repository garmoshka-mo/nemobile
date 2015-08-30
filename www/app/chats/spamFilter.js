(function(){
    factories.service('spamFilter',
        ['$resource',
function($resource) {

    var spam_filter_host = config('spamFilterHost');
    if (spam_filter_host) var spamFilter = $resource(spam_filter_host);

    this.filter = function(session, payload, callback) {
        if (_.isUndefined(spamFilter)) return;

        var data = {
            client_id: user_uuid, // todo: replace to user.uuid after refactoring of user (right now creates circular dep)
            talk_id: session.id, // identification of session, can be used by async callback
            // to inform about malicious session
            timestamp_ms: Date.now(),
            payload: // Your data to analyze. Can have arbitrary format.
                payload
        };
        spamFilter.save(data, function(response) {
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

}]);
})();

