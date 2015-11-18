(function(){
angular.module("angApp")
.service('socket',
        ['$rootScope', 'user', 'auth',
function($rootScope, user, auth) {
    
    var socket,
        accessToken, connected,
        authType, ready = false;

    function connect() {
        socket = io(config('msgServer'));
        
        socket.on('connect', function(){
            connected = true;
            tryToStart();
        });

        socket.on('disconnect', function(){
            authType = null;
            connected = false;
            ready = false;
        });

        socket.on('auth', function(envelope) {
            if (envelope.success) {
                log('authenticated to socket', envelope);
                authType = envelope.type;
                if (authType == 'user')
                    user.refreshProfile(envelope.profile);
                onReady();
            } else {
                error('socket auth failed', envelope);
                user.logoutAndGoHome();
            }
        });

        while (postponedListeners.length > 0)
            socket.on.apply(socket, postponedListeners.shift());
    }
    

    $rootScope.$on('user data loaded', takeAccessToken);
    $rootScope.$on('user logged in', takeAccessToken);

    function takeAccessToken() {
        accessToken = user.accessToken;
        tryToStart();
    }

    function tryToStart() {
        if (connected && accessToken)
            socket.emit('auth', { access_token: accessToken });
        else if (connected && !user.isLogged())
            socket.emit('auth', { guest_token: auth.getGuestToken() });
    }

    function onReady() {
        log('Socket onReady', postponedTasks);
        ready = true;

        while (postponedTasks.length > 0)
            socket.emit.apply(socket, postponedTasks.shift());
    }

    var postponedTasks = [], postponedListeners = [];
    
    return {

        on: function on() {
            if (socket)
                socket.on.apply(socket, arguments);
            else
                postponedListeners.push(arguments);
        },

        emit: function emit() {
            if (ready)
                socket.emit.apply(socket, arguments);
            else
                postponedTasks.push(arguments);
        },

        connect: connect

    };
}]);

})();