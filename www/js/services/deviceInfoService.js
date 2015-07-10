services
.service('deviceInfo', [
    function() {

        var self = this;

        self.isOnline = RAN_AS_APP ? false : true;
        self.isInfoTaken = RAN_AS_APP ? false : true;

        function onDeviceReady() {
            document.addEventListener("online", onOnline, false);
            document.addEventListener("offline", onOffline, false);
            self.isInfoTaken = true;
        }

        function onOnline() {
            self.isOnline = true;
        }

        function onOffline() {
            self.isOnline = false;
        }

        document.addEventListener("deviceready", onDeviceReady);

}]);