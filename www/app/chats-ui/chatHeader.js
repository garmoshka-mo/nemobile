angular.module('angControllers')
    .service('chatHeader',
    ['notification', 'Avatar',
function(notification, Avatar) {

    var self = this;
    this.active = false;

    this.partner = { title: "кто-то"};
    this.me = { title: "я", ava_url: Avatar.fromId('ada').urlMini };

    this.setChatHeader = function(chat) {
        self.partner.ava_url = chat.avatar.urlMini;
        self.me.ava_url = user.avatar.urlMini;
        chat.getLastUnexpiredChatSession()
            .then(
            function(chatSession) {
                self.partner.scores = chatSession.partnerScores;
                self.me.scores = chatSession.myScores;
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
    $scope.service = chatHeader;
    $scope.me = chatHeader.me;
    $scope.partner = chatHeader.partner;
}]);