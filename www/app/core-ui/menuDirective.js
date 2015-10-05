(function() {

    angular.module("angApp").service('menu', function() {      
    });

    angular.module("angApp").directive('menu', ['menu', function(menu) {
        return {
            templateUrl: "app/core-ui/menu.html?"+version,
            link: function($scope, element) {
                var $menuContent = $('.menu-content'); 
                var $whenMenuOpenDiv = $('<div class="when-menu-open"></div>');
                $menuContent.append($whenMenuOpenDiv);

                menu.open = function() {
                    $(element).addClass('menu-open');
                    $whenMenuOpenDiv.fadeIn('slow');
                };

                menu.close = function() {
                    $(element).removeClass('menu-open');
                    $whenMenuOpenDiv.fadeOut('slow');
                };

                menu.toggle = function() {
                    $(element).hasClass('menu-open') ? menu.close() : menu.open();
                };

                menu.setWidth = function(width) {
                    menu.width = width; 
                    $(element).width(width + 'px');
                };

                menu.setWidth(250);
                $whenMenuOpenDiv.click(menu.close);


                        
            }
            // controller: ['$scope', '$timeout', 'deviceInfo', 'router', controller]
        };
    }]);
    

})();