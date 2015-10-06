angular.module('angControllers')
    .service('chatHeader',
    ['notification', 'Avatar',
function(notification, Avatar) {

    var self = this;
    this.active = false;

    this.partner = { title: "кто-то"};
    this.me = { title: "Я", ava_url: Avatar.fromId('ada').urlMini };

    this.setChatHeader = function(chat) {
        self.partner.ava_url = chat.avatar.urlMini;
        self.me.ava_url = user.avatar.urlMini;
        chat.getLastUnexpiredChatSession()
            .then(
            function(chatSession) {
                self.session = chatSession;
                self.active = true;
            }
        );
    };

    this.clear = function() {
        self.active = false;
    };

    this.partnerTitleClickHandler = null;

    this.setPartnerTitleClickHandler = function(handler) {
        self.partnerTitleClickHandler = function() {
            if (handler) handler();
        };
    }

}]);


angular.module('angControllers')
    .controller('chatHeaderController',
    ['$scope', 'chatHeader', 'user',
function($scope, chatHeader, user) {
    var self = this;

    $scope.s = chatHeader;
    $scope.myScores = {};
    $scope.partnerScores = {};

    $scope.$watch('s.session', function(ses) {
        if (!ses) return;
        ses.myScores.updateUI = updateUI.bind(null, $scope.myScores);
        ses.partnerScores.updateUI = updateUI.bind(null, $scope.partnerScores);
    });


    function updateUI(local, score, recentScore){
        local.score = score;
        local.recentScore = recentScore;
        if (recentScore > 0)
            local.recentScoreFormatted = "+" + recentScore;
        else
            local.recentScoreFormatted = recentScore;

        local.recentOpacity = 1;

        local.class = {
            negative: recentScore < 0,
            'animated-fast': local.recentOpacity == 1,
            'animated-slow': local.recentOpacity == 0
        };

        setTimeout(function() {
            $scope.$apply(function() {
                local.recentOpacity = 0;
            });
        }, 2000);

    }

    $scope.myAvaClick = function() {
        log($scope.s);
    };


    function setUserAvatar(){
        if(user.isLogged() && !user.isParsingFromStorageNow) {
            $scope.s.me.ava_url = user.avatar.urlMini;
            clearInterval(self.interval)
        }
    }
    self.interval = setInterval(setUserAvatar, 300);

}]);