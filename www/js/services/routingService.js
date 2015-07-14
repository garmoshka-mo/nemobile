services
    .service('routing', [
        'notification', '$state', '$rootScope',
function(notification, $state, $rootScope) {

    var self = this;

    self.is_preload = false;

    self.goto = function(state, params) {
        window.snapper.close();

        params = params ? params : {};
        
        if (!RAN_AS_APP) {
            $state.go(state, params);
            return;        
        }

        if ($state.current == state) return;

        self.is_preload = true;
        notification.clear();

        setTimeout(function(){$state.go(state, params); $rootScope.$apply();}, 100);
    };

    $rootScope.$on('$stateChangeSuccess', stateChangeSuccess);
    function stateChangeSuccess (evt, toState, toParams, fromState, fromParams) {
        self.is_preload = false;
    }

}]);