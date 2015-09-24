(function(){
    angular.module("angFactories").factory('SlowpokesFriend',
        [
function() {

    return function SlowpokesFriend(provider, filter) {

        var test = ['привет...', 'привет ))', 'Привет!'];

        var slowpokePhrases = ['привет', 'привеи', 'рпивет', 'privet',
            'ghbdtn', 'пр', 'прив', 'привт', 'привте', 'приветь', 'приветствую',
            'добрый вечер', 'здрасте', 'приветик', 'приветос', 'прива'];

        this.isSlowpoke = function(message) {
            var m = message.replace(/[ \.)!]/g, '').toLocaleLowerCase().trim();
            if (slowpokePhrases.indexOf(m) >= 0) {
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

