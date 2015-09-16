(function(){
    services
        .service('timer',
        ['$rootScope', Timer]);
    function Timer($rootScope) {

        var timer,
            self = this;

        this.duration = 0;
        this.lastDuration = 0;

        this.start = function() {
            self.reset();
            var start = Date.now();
            timer = setInterval(function() {
                self.lastDuration = self.duration = (Date.now() - start) / 1000;
                $rootScope.$apply(function(){
                    $rootScope.notification.time = self.duration.toHHMMSS();
                });
            }, 1000);
        };

        this.stop = function() {
            clearInterval(timer);
        };

        this.reset = function() {
            clearInterval(timer);
            $rootScope.notification.time = "";
        };

    }

})();