angular.module("angServices")
    .service('router', [
        'notification', '$state', '$rootScope', '$q', 'googleAnalytics', '$location', 'separator',
function(notification, $state, $rootScope, $q, googleAnalytics, $location, separator) {

    var self = this;

    self.is_preload = false;
    self.main = {};
    self.top = {};

    self.openExternalURL = function(url) {
        if (RAN_AS_APP) {
            navigator.app.loadUrl(url, {openExternal: true});
        }
        else {
            window.open(url, '_blank');
        }
    };

    self.closeCurrent = function() {
        if (self.isChatActive())
            self.openOnTop('random');
    };

    self.openOnTop = function(stateName) {
        var state = null;
        $state.get().some(function(s) {
            if (s.name == stateName) return state = s;
        });
        if (!state) return console.error('unknown state');

        self.top  = state;
        $rootScope.topSectionTemplate = state.views.content.templateUrl;
        $rootScope.topFooterTemplate = state.views.content.footerTemplateUrl;
        separator.updateView(self);
    };

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
                    self.main = $state.current;
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
        logPageview(toState.url);
    }

    function logPageview(url) {
        if (url.startsWith('/pub'))
            googleAnalytics.pageview($location.path());
    }

    var savedStates = [];

    self.saveState = function(save){
        savedStates[$state.current.name] = save;
    };

    self.loadState = function(){
        var savedState = savedStates[$state.current.name];
        //once loaded, gets removed
        savedStates[$state.current.name] = null;
        return savedState;
    };

    self.isChatActive = function() { return self.top.name == 'chat'; };
    self.isRandomActive = function() { return self.top.name == 'random'; };

}]);