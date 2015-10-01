(function(){
angular.module("angApp")
.service('socket',
        ['$rootScope', 'user',
function($rootScope, user) {

    var socket = io(config('msgServer')),
        accessToken, connected, authenticated, ready = false;

    socket.on('connect', function(){
        connected = true;
        tryToStart();
    });

    socket.on('disconnect', function(){
        authenticated = false;
        connected = false;
        ready = false;
    });

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
            onReady();
    }

    socket.on('auth', function(envelope) {
        if (envelope.success) {
            log('authenticated to socket', envelope);
            authenticated = true;
            onReady();
        } else
            console.error('socket auth failed', envelope);
    });

    function onReady() {
        log('Socket onReady', postponedTasks);
        ready = true;
        postponedTasks.map(function(args){
            socket.emit.apply(socket, args);
        });
    }

    var postponedTasks = [];

    return {

        on: function on() {
            socket.on.apply(socket, arguments);
        },

        emit: function emit() {
            if (ready)
                socket.emit.apply(socket, arguments);
            else
                postponedTasks.push(arguments);
        }

    };
}]);

})();