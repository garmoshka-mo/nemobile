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
        var typing_timeout;

        return {

            set: function(title, ava_url, handler) {
                $rootScope.notification.text = title;
                $rootScope.notification.ava_url = ava_url;
                $rootScope.notification.handler = function() {
                    if (handler) handler();
                };
                initialText = title;
                initialHandler = $rootScope.notification.handler;
            },

            typing: function() {
                $rootScope.$apply(function() { $rootScope.notification.typing = true; });
                clearInterval(typing_timeout);
                typing_timeout = setTimeout(function() {
                    $rootScope.$apply(function() { $rootScope.notification.typing = false; });
                }, 2500);
            },

            incomeMessage: function() {
                $rootScope.notification.typing = false;
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