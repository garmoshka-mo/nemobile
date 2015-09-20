(function(){
    angular.module("angFactories").factory('ActivityBot',
        [
function() {

    return function ActivityBot(provider, disconnect) {

        var boredomTimer;

        this.wakeUp = function() {
            var patience = 10 + Math.random() * 20;
            boredomTimer = setTimeout(becomeBored, patience * 1000);
        };

        this.calmDown = function() {
            clearInterval(boredomTimer);
        };

        function becomeBored() {
            log('Im bored...');
            provider.Send('ау');
            boredomTimer = setTimeout(becomeTooBored, 6 * 1000);
        }

        function becomeTooBored() {
            log('Im too bored now.');
            disconnect();
        }

    }

}]);

})();

