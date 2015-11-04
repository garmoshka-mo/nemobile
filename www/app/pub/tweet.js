app.directive('tweet', ['$rootScope', '$sce', 'router','$location', function($rootScope, $sce, router) {
    
var ctrl = ['$scope', 'googleAnalytics',
function ($scope, googleAnalytics) {
    $scope.cutImage = function(tweet) {
        tweet.cutImage = true;
    };
    $scope.reply = function () {
        googleAnalytics.event('public', 'reply');
        fewScoresAlert();
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
