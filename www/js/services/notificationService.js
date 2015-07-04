services
.factory('notification', ['$rootScope', '$timeout',  function($rootScope, $timeout) {
    console.log("notification service is enabled");
    $rootScope.notification = {};
    var initialText;
    var initialHandler;

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
        
        clear: function() {
            $rootScope.notification.text = "";
            $rootScope.notification.animated = false;
            initialText = null;
            initialHandler = null;
        }

    };
}]);