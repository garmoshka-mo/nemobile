(function(){
services
    .service('avatars',
    [Avatars]);
function Avatars() {

    function Avatar() {
        this.url = null;
        this.url_mini = null;
    }

    this.from_photos = function(user_photos) {
        var a = new Avatar();
        a.url = user_photos[0].value;
        a.url_mini = user_photos[0].valueMini || self.photoUrl;
        return a;
    };

    this.from_id = function(user_id) {
        var a = new Avatar();
        a.url = config('adorableUrl') + '/' + user_id;
        a.url_mini = config('adorableUrl') + '/40/' + user_id;
        return a;
    };

}

})();