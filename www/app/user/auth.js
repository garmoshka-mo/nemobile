angular.module("angServices")
    .service('auth', [
        '$timeout',
function($timeout) {


    var guestToken;
    this.getGuestToken = function() {
        if (!guestToken) {
            guestToken = config('guestToken');
            if (!guestToken)
                try {
                    localStorage['guestToken'] = guestToken =
                        'guest-'+randomString(32);
                }
                catch(e) {
                    if (e.toString().match(/QuotaExceededError/)) {
                        alert('Приватный режим просмотра в сафари блокирует возможность сохранения информации в local storage, который необходим для корректной работы чата. Чтобы воспользоваться чатом, нужно войти в стандартном режиме.');
                    }
                }    
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