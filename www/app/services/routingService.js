services
    .service('routing', [
        'notification', '$state', '$rootScope', '$q',
function(notification, $state, $rootScope, $q) {

    var self = this;

    self.is_preload = false;

    self.goto = function(state, params) {
        window.snapper.close();
        var d = $q.defer();
        params = params || {};

        // For now show preloader always
//        if (!RAN_AS_APP) {
//            $state.go(state, params);
//            return;
//        }

        if ($state.current.name == state) {
            d.resolve();
            return d.promise;
        }

        self.is_preload = true;
        notification.clear();

        setTimeout(function() {
                $state.go(state, params)
                .then(function(){
                    d.resolve();
                });
                $rootScope.$apply();
            },
        100);

        return d.promise;
    };

    $rootScope.$on('$stateChangeSuccess', stateChangeSuccess);
    function stateChangeSuccess (evt, toState, toParams, fromState, fromParams) {
        self.is_preload = false;
    }

}]);