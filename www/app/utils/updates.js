(function(){
services
    .service('updates',
    ['$resource', Service]);
function Service($resource) {

    var VersionResource = $resource('/version');
    this.reloading = false;

    this.check = function() {
        if (RAN_AS_APP) return;
        // Automatic reload if server updated:
        var v = VersionResource.get(function() {
            if (v.version != version)  {
              this.reloading = true;
              location.reload();
            }
        });
    };

}

})();