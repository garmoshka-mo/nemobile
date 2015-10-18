function Watches(done) {

    var self = this,
        timeDifferenceWithServer;

    var DEBUG_OFFSET = 0 ;
    //var DEBUG_OFFSET = - (1 * 60 * 60 * 1000  + 42 * 60 * 1000);

    self.isWorkingTime = true;

    $.get(config('apiUrl') + "/working_time", function( data ) {
        var time = data['current_time'] * 1000 - DEBUG_OFFSET;
        console.log(new Date(time).toISOString());
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
            h = serverTime.getHours(),
            m = 59 - serverTime.getMinutes();

        if (isWorkingTime(h))
            return '0:00:00';

        if (h > self.openAt)
            h -= 24;

        h = self.openAt - h -1;

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