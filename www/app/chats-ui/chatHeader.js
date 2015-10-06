angular.module('angControllers')
    .service('chatHeader',
    ['$rootScope', 'user',
function($rootScope, user) {

    var self = this;
    this.active = false;

    this.partner = { title: "кто-то"};
    this.me = { title: "Я", hidden: true };


    this.setChatHeader = function(chat) {
        self.partner.ava_url = chat.avatar.urlMini;
        chat.getLastUnexpiredChatSession()
            .then(sessionReceived);
    };

    function sessionReceived(chatSession) {
        self.session = chatSession;
        self.active = true;
        chatSession.myScores.updateUI = updateUI.bind(null, self.me);
        chatSession.partnerScores.updateUI = updateUI.bind(null, self.partner);
        chatSession.partnerScores.ask();
    }

    function updateUI(local, score, recentScore){
        local.score = score;
        local.recentScore = recentScore;
        if (recentScore > 0)
            local.recentScoreFormatted = "+" + recentScore;
        else
            local.recentScoreFormatted = recentScore;

        local.recentOpacity = 1;

        local.class = {
            negative: recentScore < 0
            //'animated-fast': local.recentOpacity == 1,
            //'animated-slow': local.recentOpacity == 0
        };

        setTimeout(function() {
            $rootScope.$apply(function() {
                local.recentOpacity = 0;
            });
        }, 2000);

    }

    this.clear = function() {
        self.active = false;
    };

    this.partnerTitleClickHandler = null;

    this.setPartnerTitleClickHandler = function(handler) {
        self.partnerTitleClickHandler = function() {
            if (handler) handler();
        };
    };

    user.passivePromise.then(function(){
        if (user.myScores) {
            self.me.ava_url = user.avatar.urlMini;
            self.me.hidden = false;
            user.myScores.updateUI = updateUI.bind(null, self.me);
            user.myScores.ask();
        }
    });

}]);


angular.module('angControllers')
    .controller('chatHeaderController',
    ['$scope', 'chatHeader', 'user',
function($scope, chatHeader, user) {
    $scope.s = chatHeader;

    $scope.myAvaClick = function() {
        log($scope.s);
    };
}]);