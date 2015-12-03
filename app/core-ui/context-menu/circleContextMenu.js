(function() {

    angular.module("angApp").service('circleContextMenu', function() {      
    });

    angular.module("angApp").directive('circleContextMenu', 
    ['circleContextMenu',  
function(circleContextMenu) {
        return {
            link: function($scope, element) {
                circleContextMenu.element = element;
                var $contextMenuContainer = $(element);
                var $contextMenu = $(element).find('.circle-context-menu');

                circleContextMenu.open = function(event) {
                    setMenuCoords(event);
                    $contextMenuContainer.addClass('circle-context-menu-container-opened');
                };

                circleContextMenu.close = function() {
                    $contextMenuContainer.removeClass('circle-context-menu-container-opened');
                };

                $contextMenu.click(function(event) {
                    event.stopPropagation();
                });

                $contextMenuContainer.click(function() {
                    circleContextMenu.close();
                });

                

                function setMenuCoords(event) {
                    var x, y;

                    if (event.pageX) {
                        x = event.pageX;
                        y = event.pageY;
                    }

                    if (event.changedTouches) {
                        x = 5;
                        y = 5;
                    }

                    $contextMenu.css({
                        top: y,
                        left: x
                    });
                }
            },
            controller: ['contextMenu', '$scope',
                function(contextMenu, $scope) {
                    $scope.text = 'jhi';
                    $scope.templateUrl = 'app/core-ui/context-menu/circleContextMenu.html';   
                }]
        };
    }]);
})();