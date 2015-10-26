angular.module('angControllers')
    .service('chatHeader',
    ['$rootScope', 'user', '$postpone', 'Avatar',
function($rootScope, user, $postpone, Avatar) {

    var self = this;
    this.active = false;

    this.partner = { score: '...'};
    this.me = { title: "ß", score: '...', hidden: true };


    this.setChatHeader = function(chat) {
        if (chat.partner) {
            self.partner.ava_url = chat.partner.avatar.urlMini;
        }
        else {
            self.partner.ava_url = Avatar.fromId(Math.random()).urlMini;
        }
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

        clearTimeout(local.updateTimer);
        local.updateTimer = $postpone(100, update);

        function update() {
            local.score = score;
            local.recentScore = recentScore;
            if (recentScore != 0) showRecentScore();
        }

        function showRecentScore() {
            if (recentScore > 0)
                local.recentScoreFormatted = "+" + recentScore;
            else
                local.recentScoreFormatted = recentScore;

            local.recentOpacity = 1;

            clearTimeout(local.fadeOutTimer);
            local.fadeOutTimer = $postpone(2000, function() {
                local.recentOpacity = 0;
            });
        }
    }

    this.clear = function() {
        self.active = false;
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