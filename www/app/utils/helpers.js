String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
};

Number.prototype.toHHMMSS = function () {
    var sec_num = this;
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    seconds = Math.round(seconds);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}

    var time = "";
    if (hours > 0) time += hours + ':';

    return time + minutes + ':' + seconds;
};

Number.prototype.toDateTime = function () {

    var monthNames = [
        "Янв", "Фев", "Мар",
        "Апр", "Май", "Июн", "Июл",
        "Авг", "Сен", "Окт",
        "Ноя", "Дек"
    ];

    var date = new Date(this);
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    var hours   = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    seconds = Math.round(seconds);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}

    var time = "";
    if (hours > 0) time += hours + ':';

    return day + ' ' + monthNames[monthIndex] + ' ' + year + ' ' + time + minutes;
};