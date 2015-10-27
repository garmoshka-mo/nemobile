(function() {
    angular.module("angApp").directive('messageMenu', function() {
        return {
            scope: {items: '=', api: '='},
            templateUrl: "app/messages/messageMenu.html?"+version,
            link: function($scope, element) {
                $scope.getElementPosition = function() {
                    return {
                        x: element[0].offsetLeft,
                        y: element[0].offsetTop
                    };
                };
            },
            controller: ['$scope', '$timeout', 'deviceInfo', 'router', controller]
        };
    });

    function controller($scope, $timeout, deviceInfo, router) {
        $scope.api = {
            handleClick: function(event, message, messageIndex) {
                
                if ($(event.srcElement).hasClass('message-image')) {
                    router.goto('showImage', {link: btoa(event.srcElement.src)});
                    return;
                }
                
                if ($(event.srcElement).hasClass('message-link')) {
                    return;
                }
                
                openMenu(event, message, messageIndex);
                
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

        function openMenu(event, message, messageIndex) {
            calculateMenuPosition(event);
            $scope.openMenuParams = {
                message: message,
                messageIndex: messageIndex
            };
        }

        if($('#message-menu').length) {
            $($('.message-menu')[1]).attr('id','message-menu-edit')
        } else {
            $($('.message-menu')[0]).attr('id','message-menu')
        }
        $(document).foundation('dropdown', 'reflow');
    }
})();