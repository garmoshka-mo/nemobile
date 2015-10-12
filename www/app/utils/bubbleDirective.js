angular.module("angServices")
.directive('bubble', function() {
    return {
        restrict: 'E',

        controller: ['$scope', 'bubble',
            function($scope, bubble) {
                var $container = $('#gfy-container');
                $scope.hide = true;

                bubble.render = function(o, flags) {
                    $scope.title = o.title;
                    $scope.text = o.text;
                    $scope.bubbleClass = o.partnerSide ? 'he' : 'me';

                    var v = o.videos,
                        gfy = v[Math.floor(Math.random()*v.length)];
                    gfyCollection.get().length = 0;
                    $container.empty();
                    $container.append("<img class='gfyitem' data-id='"+gfy+"'/>");
                    gfyCollection.init();
                    $scope.hide = false;
                };

                $scope.close = function() {
                    $container.empty();
                    $scope.hide = true;
                }

            }],

        templateUrl: "app/utils/bubble.html?"+version
    };
});