(function() {

    var $menuOpenedDiv = $('<div class="circle-menu-opened-div"></div>');

    angular.module("angApp").service('circleMenu', function() {      
    });

    angular.module("angApp").directive('circleMenu', ['circleMenu',  function(circleMenu) {
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

                circleMenu.element = element;

                
            },
            controller: ['circleMenu', '$scope', 'notification', 'chats', 
                function(circleMenu, $scope, notification, chats) {
                    $scope.circleMenu = circleMenu;
                    $scope.chats = chats;

                    function closeMaterialMenu() {
                       $('.md-menu-backdrop').trigger('click');
                    }

                    function isMaterialMenuClosed() {
                        return angular.element($(circleMenu.element).find('md-menu'))
                            .scope()
                            .$mdMenuIsOpen;
                    }

                    $scope.disconnect = function(feedback) {
                        notification.chatDisconnect(feedback);
                        circleMenu.close();
                    };

                    $menuOpenedDiv.click(function(event) {
                        event.stopPropagation();
                        if (isMaterialMenuClosed()) {
                            closeMaterialMenu();
                        }
                        else {
                            circleMenu.close();
                        }
                    });
                }]
        };
    }]);
})();