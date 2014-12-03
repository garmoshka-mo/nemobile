services
.factory('notification', ['$rootScope', '$timeout', function($rootScope, $timeout) {
    console.log("notification service is enabled")
    return {
        set: function(text, handler) {
            $rootScope.notification = text;
            $rootScope.notificationHandler = function() {
                if (handler) {
                    handler();
                }
            }
        }, 
        setTemporary: function(text, time, handler) {
            var self = this;
            $rootScope.notification = text;
            $rootScope.notificationHandler = function() {
                if (handler) {
                    handler();
                }
            }
            $rootScope.notificationAnimated = true;
            time = time || 1000;
            $timeout(
                function() {
                    self.clear();
                }, 
                time
            )
        },
        clear: function() {
            $rootScope.notification = "";
            $rootScope.notificationAnimated = false;
        }
    }
}])