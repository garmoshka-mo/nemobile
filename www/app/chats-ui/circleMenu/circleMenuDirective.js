(function() {

    var $menuOpenedDiv = $('<div class="circle-menu-opened-div"></div>');

    angular.module("angApp").service('circleMenu', function() {      
    });

    angular.module("angApp").directive('circleMenu', ['circleMenu', 'contextMenu',  function(circleMenu, contextMenu) {
        return {
            templateUrl: "app/chats-ui/circleMenu/circleMenu.html?"+version,
            link: function($scope, element) {
                var $menu = $(element).find('.circle-menu-container');
                $('.menu-content').prepend($menuOpenedDiv);

                circleMenu.open = function() {
                    $menu.addClass('circle-menu-open');
                    $menuOpenedDiv.show();
                };

                circleMenu.close = function() {
                    $menu.removeClass('circle-menu-open');
                    $menuOpenedDiv.hide();
                };

                circleMenu.isOpened = function (argument) {
                    return $menu.hasClass('circle-menu-open');
                };

                circleMenu.element = element;


            },
            controller: ['circleMenu', '$scope', 'notification', 'chats', 'contextMenu', 
                function(circleMenu, $scope, notification, chats, contextMenu) {
                    $scope.circleMenu = circleMenu;
                    $scope.chats = chats;
                    $scope.contextMenu = contextMenu;

                    $scope.disconnect = function(feedback) {
                        notification.chatDisconnect(feedback);
                        circleMenu.close();
                    };

                    function onOpenDivClick(event) {
                        event.stopPropagation();
                        circleMenu.close();
                       
                    }

                    $scope.$watch('chats.disconnectWithoutFeedback', function(newValue, oldValue) {
                        if (circleMenu.isOpened() && newValue) {
                            contextMenu.close();
                            $scope.disconnect();
                        }
                    });

                    $menuOpenedDiv.on('click', onOpenDivClick);
                    $menuOpenedDiv.on('touchstart', onOpenDivClick);
                }]
        };
    }]);
})();