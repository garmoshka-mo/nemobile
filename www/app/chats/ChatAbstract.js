(function(){
angular.module("angFactories")
    .factory('ChatAbstract',
        ['$rootScope', 'user',
function($rootScope, user) {

    return function ChatAbstract() {

        var self = this;
        this.extend = function(child) {
            angular.extend(child, this);
            self = child;
        };

        this.processScores = function(scores) {
            if (self.isActive)
                this.ensureSession().then(function(session){
                    session.updateScores(scores);
                });
        };

    }

}]);

})();

