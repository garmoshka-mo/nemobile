(function(){
services
    .service('updates',
    ['$resource', Service]);
function Service($resource) {

    var VersionResource = $resource('/version');

    this.check = function() {
        // Automatic reload if server updated:
        var v = VersionResource.get(function() {
            if (v.version != version) location.reload();
        });
    };

}

})();