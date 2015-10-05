angular.module("angServices")
.service('deviceInfo', [
    function() {

        var self = this;

        self.isOnline = RAN_AS_APP ? false : true;
        self.isInfoTaken = RAN_AS_APP ? false : true;
        self.isIos = RAN_AS_APP ? false : null;
        self.isAndroid = RAN_AS_APP ? false : null;
        self.isOldAndroid = RAN_AS_APP ? false : null;
        self.isTouch = isTouchDevice = 'ontouchstart' in document.documentElement;

        function onDeviceReady() {
            document.addEventListener("online", onOnline, false);
            document.addEventListener("offline", onOffline, false);
            navigator.splashscreen.hide();
            self.isInfoTaken = true;
            self.isAndroid = device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos";
            self.isIos = device.platform == 'iOS';
            if (self.isIos) {
                cordova.plugins.Keyboard.disableScroll(true);
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }

            if (self.isAndroid) {
                self.isOldAndroid = window.device.version < "4.4";
            }
            else {
                self.isOldAndroid = false;
            }
        }

        function onOnline() {
            self.isOnline = true;
        }

        function onOffline() {
            self.isOnline = false;
        }

        document.addEventListener("deviceready", onDeviceReady);

}]);