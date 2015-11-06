app.directive('tweet', ['$rootScope', '$sce', 'router','$location', function($rootScope, $sce, router) {
    
var ctrl = ['$scope', 'googleAnalytics', 'posts',
function ($scope, googleAnalytics, posts) {
    $scope.cutImage = function(tweet) {
        tweet.cutImage = true;
    };
    $scope.showReplyForm = function() {
        $scope.replyFormShown = !$scope.replyFormShown;
    };
    $scope.reply = function (tweet, text) {
        googleAnalytics.event('public', 'reply');
        if (!text) {
            $scope.replyNotice = 'Нельзя отправить пустой ответ';
            return;
        }
        if (text.length > 140) {
            $scope.replyNotice = 'Лимит ответа - 140 символов';
            return;
        }

        $scope.replying = true;
        posts.reply(tweet.id, text).then(function (data) {
            //TODO: instantly show reply in replies section
            //tweet.replies.unshift(...)
            $scope.replying = false;
            $scope.replyText = '';
            $scope.replyNotice = 'Успешно';
        });
        //fewScoresAlert();
    };

    function fewScoresAlert() {
        $('#few-scores-alert').foundation('reveal', 'open');
    }
}];
    
return {
    restrict: 'E',
    scope: {
        tweet: "="
    },
    controller: ctrl, 
    templateUrl: "app/pub/tweet.html?"+version
};
    
}]);
