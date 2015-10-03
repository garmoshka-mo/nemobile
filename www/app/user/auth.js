angular.module("angServices")
    .service('auth', [
        '$timeout',
function($timeout) {


    var guestToken;
    this.getGuestToken = function() {
        if (!guestToken) {
            guestToken = config('guestToken');
            if (!guestToken)
                localStorage['guestToken'] = guestToken =
                    'guest-'+randomString(32);
        }
        return guestToken;
    };

    function randomString(length) {
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
        return result;
    }

}]);