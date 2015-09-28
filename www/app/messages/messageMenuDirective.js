(function() {
    angular.module("angApp").directive('messageMenu', function() {
        return {
            scope: {items: '=', api: '='},
            templateUrl: "app/messages/messageMenu.html",
            link: function($scope, element) {
                $scope.getElementPosition = function() {
                    return {
                        x: element[0].offsetLeft,
                        y: element[0].offsetTop
                    };
                };
            },
            controller: ['$scope', '$timeout', 'deviceInfo', controller]
        };
    });

    function controller($scope, $timeout, deviceInfo) {
        $scope.api = {
            open: function(event, message, messageIndex) {
                calculateMenuPosition(event);
                $scope.openMenuParams = {
                    message: message,
                    messageIndex: messageIndex
                };
                //$mdOpenMenu is injected from md-menu scope
                //in message menu template
                $timeout(function() {
                    $scope.$mdOpenMenu(event);
                }, 0);
            }
        };

        $scope.onMenuItemClick = function(item) {
            item.handler($scope.openMenuParams.message, $scope.openMenuParams.messageIndex);
        };

        function calculateMenuPosition(event) {
            var x, y;

            if (deviceInfo.isTouch) {
                x = event.changedTouches[0].pageX;       
                y = event.changedTouches[0].pageY;       
            }
            else {
                x = event.x;
                y = event.y;
            }
            var psedoMenuCoords = $scope.getElementPosition();
            $scope.menuX = x - psedoMenuCoords.x;
            $scope.menuY = y - psedoMenuCoords.y;
        }


    }
})();