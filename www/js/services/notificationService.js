services
.factory('notification', ['$rootScope', '$timeout', function($rootScope, $timeout) {
    console.log("notification service is enabled");
    $rootScope.notification = {}
    return {
        
        set: function(text, handler) {
            $rootScope.notification.text = text;
            $rootScope.notification.handler = function() {
                if (handler) {
                    handler();
                }
            }
        },

        setTemporary: function(text, time, handler) {
            var self = this;
            $rootScope.notification.text = text;
            $rootScope.notification.handler = function() {
                if (handler) {
                    handler();
                }
            }
            $rootScope.notification.animated = true;
            time = time || 1000;
            $timeout(
                function() {
                    self.clear();
                }, 
                time
            )
        },
        
        clear: function() {
            $rootScope.notification.text = "";
            $rootScope.notification.animated = false;
        },

        setOSNotification: function(message, title, json, handler) {
            window.plugin.notification.local.add({
              id: '1',
              title: title,
              message: message,
              json: JSON.stringify(json),
              autoCancel: true
              // sound: 'android.resource://Chat/raw/notification'
            });
            window.plugin.notification.local.onclick = function(id, state, json) {
                if (handler) {
                    handler(JSON.parse(json));
                }
            };
        }
    }
}])