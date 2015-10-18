(function() {

    angular.module("angApp").service('contextMenu', function() {      
    });

    angular.module("angApp").directive('contextMenu', ['contextMenu',  function(contextMenu) {
        return {
            link: function($scope, element) {
                contextMenu.element = element;
                var $contextMenuContainer = $(element);
                var $contextMenu = $(element).find('.context-menu');

                contextMenu.open = function(event) {
                    setMenuCoords(event);
                    $contextMenuContainer.addClass('context-menu-container-opened');
                };

                contextMenu.close = function() {
                    $contextMenuContainer.removeClass('context-menu-container-opened');
                };

                $contextMenu.click(function(event) {
                    event.stopPropagation();
                });

                $contextMenuContainer.click(function() {
                    contextMenu.close();
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
                    $scope.templateUrl = 'app/core-ui/context-menu/circleMenuContextMenu.html';   
                }]
        };
    }]);
})();