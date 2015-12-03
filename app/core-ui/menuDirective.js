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
                var $menuOpenedDiv = $('<div class="when-menu-open"></div>');
                $menuContent.append($menuOpenedDiv);

                function onOpenClose() {
                    addAnimation();
                    removeTransform();
                    menu.openning = false;
                    allowOpenning = false;
                    $menuOpenedDiv.css('opacity', '');
                }

                function showMenuOpenedDiv() {
                    $menuOpenedDiv.addClass('show');
                    if ($menuOpenedDiv.css('opacity')) {
                        $menuOpenedDiv.addClass('opened');
                    }
                    else {
                        setTimeout(function() {
                            $menuOpenedDiv.addClass('opened');
                        }, 100);
                    }
                }

                function hideMenuOpenedDiv() {
                    $menuOpenedDiv.removeClass('opened');
                    setTimeout(function() {
                        $menuOpenedDiv.removeClass('show');
                    }, 300);
                }

                menu.open = function() {
                    $menu.addClass('menu-open');
                    showMenuOpenedDiv();
                    onOpenClose();
                };

                menu.close = function() {
                    $menu.removeClass('menu-open');
                    hideMenuOpenedDiv();
                    onOpenClose();
                };

                menu.toggle = function() {
                    $menu.hasClass('menu-open') ? menu.close() : menu.open();
                };

                menu.setWidth = function(width) {
                    menu.width = width; 
                    $menu.width(width + 'px');
                };

                var menuContentHammer = new Hammer($menuContent.get(0), {
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
                
                menuContentHammer.on('pan', function(event) {
                    if (!allowOpenning) {
                        return;
                    }
                    var nextX = calculateNextX(event);
                    $menuOpenedDiv.css('opacity', (menu.width + nextX) / menu.width);
                    menu.openning = true; 
                    // console.log(nextX);
                    if (nextX > 0) {
                        menu.open();
                        return;
                    }
                    $menu.css('transform', 'translate3d(' + nextX + 'px, 0,0)');
                    $menu.css('-webkit-transform', 'translate3d(' + nextX + 'px, 0,0)');
                    // console.log(event);
                });

                menuContentHammer.on('panend', function() {
                    if (menu.openning) {
                        previousPanX = 0;
                        allowOpenning = false;
                        finishAction();
                    }
                });

                menuContentHammer.on('panstart', function(event) {
                    if ($(event.target).hasClass('no-menu-drag')) {
                        return;
                    }
                    
                    if (event.pointers[0].clientX > $menuContent.width() / 3) {
                        allowOpenning = false;
                        return;
                    }
                    if (event.angle < 45 && event.angle > -45) {
                        allowOpenning = true;
                        $menuOpenedDiv.addClass('show');
                    } 
                    else {
                        allowOpenning = false;
                    }
                });

                function removeTransform() {
                    $menu.css('transform', '');
                    $menu.css('-webkit-transform', '');
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

                var menuHammer = new Hammer($menu.get(0), {
                    inputClass: Hammer.TouchMouseInput
                });

                menuHammer.on('panleft', function() {
                    menu.close();
                });

                menu.setWidth(250);
                $menuOpenedDiv.click(function(event) {
                    event.stopPropagation();
                    menu.close();
                });
            },
            controller: 'menuController'
        };
    }]);
})();