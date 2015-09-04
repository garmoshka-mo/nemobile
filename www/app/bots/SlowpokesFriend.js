(function(){
    factories.factory('SlowpokesFriend',
        [
function() {

    return function SlowpokesFriend(provider, filter) {

        var slowpokePhrases = ['привет', 'привеи', 'рпивет',
            'привет.', 'привет!', 'ghbdtn'];

        this.isSlowpoke = function(message) {
            if (slowpokePhrases.indexOf(message.toLocaleLowerCase().trim()) >= 0) {
                reAsk();
                return true;
            }
        };

        function reAsk() {
            var msg = 'привет. ты м или ж?';
            provider.Send(msg);
            filter.log({text: msg, isOwn: true});
        }

    }

}]);

})();

