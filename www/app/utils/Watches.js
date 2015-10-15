function Watches(done) {

    var self = this,
        timeDifferenceWithServer;

    self.isWorkingTime = true;

    $.get(config('apiUrl') + "/working_time", function( data ) {
        var time = data['current_time'] * 1000;
        timeDifferenceWithServer = Date.now() - time;
        var h = new Date(time).getHours();
        self.openAt = data['open_at'];
        self.closeAt = data['close_at'];
        self.isWorkingTime = isWokringTime(h);
        done();
    });

    self.left = function(dots) {
        var serverTime = new Date(Date.now() - timeDifferenceWithServer),
            h = self.openAt - serverTime.getHours() - 1,
            m = 60 - serverTime.getMinutes();

        if (isWokringTime(h)) {
            location.reload();
        }

        return h + (dots ? ":" : " ") + m;
    }

    function isWokringTime(h){
        return h > self.openAt &&  h < self.closeAt;
    }

}