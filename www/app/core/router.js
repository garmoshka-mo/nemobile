angular.module("angServices")
    .service('router', [
        'notification', '$state', '$rootScope', '$q', 'googleAnalytics',
        '$location', 'separator', 'chatHeader', 'menu',
function(notification, $state, $rootScope, $q, googleAnalytics,
         $location, separator, chatHeader, menu) {

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

    self.openOnTop = function(stateName) {
        chatHeader.clear();

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
        menu.close();
        var d = $q.defer();
        params = params || {};

        $rootScope.hidingTopSection = false;
        if (top) {
            if (top.hide) {
                $rootScope.hidingTopSection = true;
            }
        }

        if ($state.current.name == state) {
            d.resolve();
            return d.promise;
        }

        self.is_preload = true;

        setTimeout(function() {
                $state.go(state, params).then(loadState);
                $rootScope.$apply();
            },
        100);

        function loadState(){
            self.main = $state.current;
            $rootScope.mainFooterTemplate = $state.current.views.content.footerTemplateUrl;

            d.resolve();
        }

        return d.promise;
    };

    $rootScope.$on('$stateChangeSuccess', stateChangeSuccess);
    function stateChangeSuccess (evt, toState, toParams, fromState, fromParams) {
        self.is_preload = false;
        logPageview(toState.url);

        if (toState.views.top)
            if(toState.views.top.state) {
                if (!self.isChatActive())
                    self.openOnTop(toState.views.top.state);
            } else if(typeof toState.views.top.resize != 'undefined')
                separator.resize(toState.views.top.resize);
    }

    function logPageview(url) {
        if (url.startsWith('/pub'))
            googleAnalytics.pageview($location.path());
    }

    self.isChatActive = function() { return self.top.name == 'chat'; };
    self.isRandomActive = function() { return self.top.name == 'random'; };
    self.isTopSectionActive = function() { return !!self.top.name; };


}]);