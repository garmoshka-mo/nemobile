(function(){
    angular.module("angServices")
        .service('tracker',
        ['$resource',
function ($resource) {

    var trackData = {};

    if (document.referrer)
        trackData.referrer = document.referrer;

    if (location.search)
        trackData.track = location.search.substr(1);

    this.getTrackData = function() {
        return trackData;
    };

}]);

})();