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
        if (IS_APP) {
            // navigator.app.loadUrl(url, {openExternal: true});
            window.open(url, "_system");
        }
        else {
            window.open(url, '_blank');
        }
    };

    self.changeChatState = function (stateName) {
        //if (separator.isVisible())
            self.openOnTop(stateName);
        //else
        //    self.goto(stateName);
    };
    
    self.openOnTop = function(stateName) {
        var state = null;
        $state.get().some(function(s) {
            if (s.name == stateName) return state = s;
        });
        if (!state) return error('unknown state', state);

        self.top  = state;

        if(!self.isChatActive()) {
            chatHeader.clear();
        }
        $rootScope.topSectionTemplate = state.views.content.templateUrl;
        $rootScope.topFooterTemplate = state.views.content.footerTemplateUrl;
        separator.updateView(self);
    };


    self.goto = function(state, params) {
        menu.close();
        var d = $q.defer();
        params = params || {};

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
        previousState.saveMain([state, params]);
        return d.promise;
    };

    var previousState = {
        saveTopHidden: function(hidden) {
            this.prevTopHidden = this.currTopHidden;
            this.currTopHidden = hidden;
        },
        saveMain: function(params) {
            this.prevMain = this.currMain;
            this.currMain = params;
        }
    };

    self.goBack = function() {
        if(self.isChatActive() && !previousState.prevTopHidden)
            self.changeChatState('chat');
        if(previousState.prevMain)
            self.goto.apply(undefined, previousState.prevMain);
        else
            self.goto('pubsList');
        previousState.prevMain = ['pubsList'];
        previousState.currTopHidden = null;
    };

    $rootScope.$on('$stateChangeSuccess', stateChangeSuccess);
    function stateChangeSuccess (evt, toState, toParams, fromState, fromParams) {
        $rootScope.stateName = toState.name;
        self.is_preload = false;
        logPageview(toState.url);
        //$translate
        //TODO: find a way to translate titles
        //
        if (toState.views.top) {
            if (toState.views.top.state) {
                if (self.isChatActive())
                    self.changeChatState('chat');
                else
                    self.openOnTop(toState.views.top.state);
            } else if (typeof toState.views.top.resize != 'undefined') {
                separator.resize(toState.views.top.resize, toState.views.top.disableAnimation);
                previousState.saveTopHidden(!separator.isVisible());
            }
        } else {
            separator.resize('hide', true);
            previousState.saveTopHidden(true);
        }
    }

    function logPageview(url) {
        if (url.startsWith('/pub'))
            googleAnalytics.pageview($location.path());
    }

    self.isChatActive = function() { return self.top.name == 'chat'; };
    self.isRandomActive = function() { return self.top.name == 'random'; };
    self.isTopSectionActive = function() { return !!self.top.name; };


}]);