angular.module("angServices")
.directive('bubble', function() {
    return {
        restrict: 'E',

        controller: ['$scope', 'bubble',
            function($scope, bubble) {
                var $container = $('#gfy-container');
                var $preventClick = $('.prevent-click');
                $scope.hide = true;

                bubble.render = function(o, flags) {
                    $preventClick.show();
                    if (!$scope.hide) return;

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
                    $preventClick.hide();
                    $scope.hide = true;
                }

                $preventClick.click(function() {
                    if(!$scope.hide) {
                        $scope.close();
                    }
                });

            }],

        templateUrl: "app/utils/bubble.html?"+version
    };
});