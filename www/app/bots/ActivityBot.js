(function(){
    factories.factory('ActivityBot',
        [
function() {

    return function ActivityBot(provider) {

        var boredomTimer;

        this.wakeUp = function() {
            boredomTimer = setTimeout(becomeBored, (5 + Math.random() * 15) * 1000);
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
            provider.Disconnect();
        }

    }

}]);

})();

