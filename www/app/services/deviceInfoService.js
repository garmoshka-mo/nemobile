angular.module("angServices")
.service('deviceInfo', [
    function() {

        var self = this;

        self.isOnline = RAN_AS_APP ? false : true;
        self.isInfoTaken = RAN_AS_APP ? false : true;
        self.isIos = RAN_AS_APP ? false : null;
        self.isAndroid = RAN_AS_APP ? false : null;
        self.isOldAndroid = RAN_AS_APP ? false : null;

        function onDeviceReady() {
            document.addEventListener("online", onOnline, false);
            document.addEventListener("offline", onOffline, false);
            self.isInfoTaken = true;
            self.isAndroid = device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos";
            self.isIos = device.platform == 'iOS';
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