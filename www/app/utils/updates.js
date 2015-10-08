(function(){
angular.module("angServices")
    .service('updates',
    ['$resource', Service]);
function Service($resource) {

    var self = this,
        VersionResource = $resource('/version');

    self.reloading = false;

    this.check = function() {
        if (IS_APP) return;
        // Automatic reload if server updated:
        var v = VersionResource.get(function() {
            if (v.version != version)  {
                self.reloading = true;
                location.reload();
            }
        });
    };

}

})();