app.directive('tweet', ['$rootScope', '$sce', 'router','$location', function($rootScope, $sce, router) {
    return {
        restrict: 'E',
        scope: {
            tweet: "="
        },
        link: function(scope, elem, attr) {
            scope.cutImage = function(tweet) {
                tweet.cutImage = true;
            };
        },
        templateUrl: "app/pub/tweet.html?"+version
    };
}]);
