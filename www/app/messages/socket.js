(function(){
angular.module("angApp")
.service('socket',
        ['$rootScope', 'user',
function($rootScope, user) {

    var socket = io(config('msgServer')),
        accessToken, connected, authenticated;

    socket.on('connect', function(){
        connected = true;
        authenticate();
    });

    socket.on('disconnect', function(){
        authenticated = false;
        connected = false;
        authenticate();
    });

    $rootScope.$on('user data parsed', accessTokenReady);
    $rootScope.$on('user logged in', accessTokenReady);

    function accessTokenReady() {
        accessToken = user.accessToken;
        authenticate();
    }

    function authenticate() {
        if (connected && accessToken)
            socket.emit('auth', { access_token: accessToken });
    }

    socket.on('auth', function(envelope) {
        if (envelope.success) {
            log('authenticated to socket', envelope);
            authenticated = true;
        } else
            console.error('socket auth failed', envelope);
    });

    return socket;
}]);

})();