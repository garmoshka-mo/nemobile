services
    .service('routing', [
        'notification', '$location', '$rootScope',
function(notification, $location, $rootScope) {

    var self = this;

    self.is_preload = false;

    self.goto = function(target) {
        window.snapper.close();

        if ($location.path() == target) return;

        self.is_preload = true;
        notification.clear();

        setTimeout(function(){$location.path(target); $rootScope.$apply();}, 100);
    };

    $rootScope.$on('$stateChangeSuccess', stateChangeSuccess);
    function stateChangeSuccess (evt, toState, toParams, fromState, fromParams) {
        self.is_preload = false;
    }

}]);