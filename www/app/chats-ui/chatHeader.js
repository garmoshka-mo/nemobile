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
        user.honor.turnOff();
        chatSession.myScores.onUpdate(updateUI.bind(null, self.me));
        chatSession.partnerScores.onUpdate(updateUI.bind(null, self.partner));
    }

    function updateUI(local, score, recentScore){
        local.score = score;
        local.recentScore = recentScore;

        if (recentScore != 0) showRecentScore();

        function showRecentScore() {
            if (recentScore > 0)
                local.recentScoreFormatted = "+" + recentScore;
            else
                local.recentScoreFormatted = recentScore;

            local.recentOpacity = 1;
            setTimeout(function() {
                $rootScope.$apply(function() {
                    local.recentOpacity = 0;
                });
            }, 2000);
        }

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
        self.me.ava = user.avatar;
        self.me.hidden = false;
        user.honor.onUpdate(updateUI.bind(null, self.me));
    });

}]);


angular.module('angControllers')
    .controller('chatHeaderController',
    ['$scope', 'chatHeader', 'router',
function($scope, chatHeader, router) {
    $scope.s = chatHeader;

    $scope.myAvaClick = function() {
        router.goto('loadAvatar');
    };
}]);