(function() {

    angular.module("angApp").service('menu', function() {      
    });

    angular.module("angApp").directive('menu', ['menu', function(menu) {
        return {
            templateUrl: "app/core-ui/menu.html?"+version,
            link: function($scope, element) {
                var ALLOWED_ANGLE = 30;
                var allowOpenning = false;
                var $menu = $(element);
                var $menuContent = $('.menu-content'); 
                var $whenMenuOpenDiv = $('<div class="when-menu-open"></div>');
                $menuContent.append($whenMenuOpenDiv);

                function onOpenClose() {
                    addAnimation();
                    removeTransform();
                    menu.openning = false;
                    allowOpenning = false;
                }

                menu.open = function() {
                    onOpenClose();
                    $menu.addClass('menu-open');
                    $whenMenuOpenDiv.fadeIn('slow');
                };

                menu.close = function() {
                    onOpenClose();
                    $menu.removeClass('menu-open');
                    $whenMenuOpenDiv.fadeOut('slow');
                };

                menu.toggle = function() {
                    $menu.hasClass('menu-open') ? menu.close() : menu.open();
                };

                menu.setWidth = function(width) {
                    menu.width = width; 
                    $menu.width(width + 'px');
                };

                var menuHammer = new Hammer($menuContent.get(0), {
                    inputClass: Hammer.TouchMouseInput
                });

                var previousPanX = 0;
                function calculateNextX(event) {

                    if (previousPanX === 0) {
                        removeAnimation();
                    }
                    // console.log(event.deltaX);
                    var previousX = -1 * menu.width;
                    if ($menu.css('transform')) {
                        previousX = getCurrentX();
                    }
                    var distance = event.deltaX - previousPanX;
                    previousPanX = event.deltaX;
                    return  previousX + distance;
                }
                
                menuHammer.on('pan', function(event) {
                    if (!allowOpenning) {
                        return;
                    }
                    console.log('pan');
                    var nextX = calculateNextX(event);
                    menu.openning = true; 
                    // console.log(nextX);
                    if (nextX > 0) {
                        menu.open();
                        return;
                    }
                    $menu.css('transform', 'translate3d(' + nextX + 'px, 0,0)');
                    // console.log(event);
                });

                menuHammer.on('panend', function() {
                    if (menu.openning) {
                        previousPanX = 0;
                        allowOpenning = false;
                        finishAction();
                    }
                });

                menuHammer.on('panstart', function(event) {
                    if (event.pointers[0].clientX > $menuContent.width() / 3) {
                        allowOpenning = false;
                        return;
                    }
                    if (event.angle < 45 && event.angle > -45) {
                        allowOpenning = true;
                    } 
                    else {
                        allowOpenning = false;
                    }
                });

                function removeTransform() {
                    $menu.css('transform', '');
                }

                function addAnimation() {
                    $menu.addClass('menu-animated');
                }

                function removeAnimation() {
                    $menu.removeClass('menu-animated');
                }

                function finishAction() {
                    var currentX = getCurrentX();
                    if (currentX > (-1 * menu.width / 2)) {
                        menu.open();
                    }
                    else {
                        menu.close();
                    }
                }

                function getCurrentX() {
                    var transformString = $menu.css('transform');
                    return +transformString.match(/matrix\(\d+, \d+, \d+, \d+, ([-]*\d+\.*\d*), \d\)/)[1];
                }

                menu.setWidth(250);
                $whenMenuOpenDiv.click(menu.close);
            }
            // controller: ['$scope', '$timeout', 'deviceInfo', 'router', controller]
        };
    }]);



   
    

})();