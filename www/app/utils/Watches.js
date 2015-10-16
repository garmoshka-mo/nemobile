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
        self.isWorkingTime = isWorkingTime(h);
        done();
    });

    function isWorkingTime(h){
        return h >= self.openAt &&  h < self.closeAt;
    }

    self.left = function(dots) {
        var serverTime = new Date(Date.now() - timeDifferenceWithServer),
            h = self.openAt - serverTime.getHours() - 1,
            m = 59 - serverTime.getMinutes();

        if (h < 0) {
            return '0:00:00';
        }

        if (m < 10) m = '0'+m;

        var time = h + (dots ? ":" : " ") + m;

        if (h + m == 0) {
            var s = 59 - serverTime.getSeconds();
            if (s < 10) s = '0'+s;
            time += (dots ? ":" : " ") + s;
        }

        return time;
    };



}