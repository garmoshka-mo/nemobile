(function(){
    services
        .service('notification',
        ['$rootScope', '$timeout', Service]);
    function Service($rootScope, $timeout) {
        log("notification service is enabled");
        $rootScope.notification = {};
        var initialText;
        var initialHandler;
        var incomeMessageSound = new Audio('assets/sounds/alert.mp3');

        return {

            set: function(text, handler) {
                $rootScope.notification.text = text;
                $rootScope.notification.handler = function() {
                    if (handler) {
                        handler();
                    }
                };
                initialText = text;
                initialHandler = $rootScope.notification.handler;
            },

            incomeMessage: function() {
                incomeMessageSound.play();
            },


        setTemporary: function(text, time, handler) {
                var self = this;
                $rootScope.notification.text = text;
                $rootScope.notification.handler = function() {
                    if (handler) {
                        handler();
                    }
                };
                $rootScope.notification.animated = true;
                time = time || 1000;
                $timeout(
                    function() {
                        if (initialText) {
                            if (initialHandler) {
                                self.set(initialText, initialHandler);
                            }
                            else {
                                self.set(initialText);
                            }
                        }
                        else {
                            self.clear();
                        }
                    },
                    time
                );
            },

            setSmallIcon: function(html, handler) {
                $rootScope.customSmallIconInner = html;
                $rootScope.customSmallIconHandler = handler;
                $rootScope.$on('$stateChangeStart', function() {
                    $rootScope.customSmallIconInner =
                        $rootScope.customSmallIconHandler = null;
                });
            },

            clear: function() {
                $rootScope.notification.text = "";
                $rootScope.notification.animated = false;
                initialText = null;
                initialHandler = null;
            }

        };
    }

})();