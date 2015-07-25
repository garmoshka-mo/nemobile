app.directive('stopEvent', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            element.bind("click touchstart", function (e) {
                e.stopPropagation();
            });
        }
    };
 });

app.directive('stopEventPrevent', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            element.bind("click touchstart", function (e) {
                e.stopPropagation();
                e.preventDefault();
            });
        }
    };
 });

app.directive('overscrollableWithFooter', function() {
    return {
        link: function(scope, elem, attr) {
            $(elem).css({
                    "height": "100%",
                    "width": "100%",
                    "padding-right": "15px",
                    "box-sizing": "content-box",
                    "overflow": "auto"
            });
        }
    };
});

$(function() {
    window.BODY_HEIGHT = $('body').height();
    window.TAB_BAR_HEIGHT = $('.tab-bar').height();
});

app.directive('overscrollableWithoutFooter', function() {
    return {
        link: function(scope, elem, attr) {
            var bodyHeight = $('body').height();
            $(elem).height(bodyHeight - $('.tab-bar').height());
            $(elem).css({
                  "width": "100%",
                  "padding-right": "15px",
                  "box-sizing": "content-box",
                  "overflow": "auto"
            });
        }
    };
});

app.directive('overscrollableFriends', ['$timeout', function($timeout) {
    return {
        link: function(scope, elem, attr) {
            scope.$watch('user.friendsList.friends.length', function() {
                $timeout(function() {
                    $(elem).height(BODY_HEIGHT - $(".friendListHeader ").outerHeight() - TAB_BAR_HEIGHT);
                    $(elem).css({
                          "width": "100%",
                          "padding-right": "15px",
                          "box-sizing": "content-box",
                          "overflow": "auto"
                    });
                }, 0);
            });
        }
    };
}]);

app.directive('stickersGalleryHeight', function() {
    return {
        link: function(scope, elem, attr) {

            // console.log("top bar height: ", emPixels * topBarHeight_rem);
            // console.log("chat keyboard height: ", $('.chat-buttons-container').height());
            
            var INPUT_FIELD_HEIGHT = 72;
            var KEYBOARD_PADDING = 20;
            var IPHONE_TOP_BAR_HEIGHT = 20;

            var stickersGalleryHeight = BODY_HEIGHT - TAB_BAR_HEIGHT - INPUT_FIELD_HEIGHT - KEYBOARD_PADDING; 
            
            if (RAN_AS_APP) {
                if (device.platform == "iOS") {
                    stickersGalleryHeight = stickersGalleryHeight - IPHONE_TOP_BAR_HEIGHT;
                }
            }

            $(elem).height(stickersGalleryHeight);
        }
    };
});

app.directive('imageonload', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function(event) {
                //call the function that was passed
                scope.$apply(attrs.imageonload);
            });
            element.bind('error', function(event) {
                //call the function that was passed
                var randomNum = Math.round(Math.random() * 100);
                $(element).attr('src', "http://api.adorable.io/avatars/40/" + randomNum); 
            });
        }
    };
});

app.directive('npTouchstart', function() {
    return {
        link: function(scope, elem, attr) {
            $(elem).on("click touchstart", function() {
                scope[attr.npTouchstart]();
            });
        }
    };
});

app.directive('spinner', function() {
    return {
        template: '<div class="spinner"><div class="dot bounce1"></div><div class="dot bounce2"></div><div class="dot bounce3"></div></div>',
        link: function(scope, elem, attr) {
            var dots = $(elem).find(".dot");
            if (attr.spinnerColor == "grey") {
                dots.addClass("grey");
            }
            if (attr.spinnerColor == "white") {
                dots.addClass("white");
            }
            if (attr.spinnerColor == "blue") {
                dots.addClass("blue");
            }
            else {
                dots.addClass("black");
            }
        }
    };
});

app.directive('clearAllButton', function() {
    return {
        scope: {
            ngModel: "="
        },
        link: function(scope, elem, attr) {
            $wrapper = $("<div class='clear-all-wrapper'></div>");
            var $clearButton = $("<div class='clear-all-button'><i class='fa fa-close'></i></div>");
            $(elem).css({'padding-right':'22px'});
            $(elem).wrap($wrapper);
            $clearButton.insertAfter(elem);
            $clearButton.click(function () {
                // console.log("clicked");
                scope.ngModel = "";
                scope.$apply();
                elem.focus();
            });
            // $clearButton.hide();
            // $(elem).on('focus', function() {
            //     $clearButton.show();
            // });
            // $(elem).on('blur', function(event) {
            //     console.log('blurred');
            
            //     setTimeout(function() {$clearButton.hide()},250);
            // });
        }
    };
});

app.directive('clearAllButtonInline', function() {
    return {
        scope: {
            ngModel: "="
        },
        link: function(scope, elem, attr) {
            var $clearButton = $("<div class='clear-all-button clear-all-button-inline'><i class='fa fa-close'></i></div>");
            $(elem).css({'padding-right':'22px'});
            $clearButton.insertAfter(elem);
            $clearButton.click(function () {
                // console.log("clicked");
                scope.ngModel = "";
                scope.$apply();    
            });
        }
    };
});

app.directive('alertBox', function() {
    return {
        template: '<div ng-show="ngModel" data-alert class="alert-box warning"><span ng-bind="ngModel"></span><span ng-click="close()" class="close pointer">&times;</span></div>',
        scope: {
            ngModel: "="
        },
        link: function(scope, elem, attr) {
            scope.close = function() {
                console.log("closed");
                scope.ngModel = '';
            };       
        }
    };
});

app.directive('slideMenu', function() {
    return {
        link: function(scope, elem, attr) {
            window.snapper = new Snap({
                element: elem[0],
                hyperextensible: false,
                maxPosition: 250,
                minPosition: 0
            });

            var $preventClickDiv = $('.prevent-click');

            $(document).on('click','.off-canvas-list', function() {
                // console.log('clicked');
                snapper.close();
            });

            function onOpen() {
                $preventClickDiv.show();     
            }

            function onAnimated() {
                var state = snapper.state();
                if (state.state == "left") {
                    onOpen();
                }
                else {
                    onClose();
                }
            }

            function onClose() {
                $preventClickDiv.hide();                    
            }
            
            setTimeout(function() {
                snapper.on('open', onOpen);
                snapper.on('animated', onAnimated);
                snapper.on('end', onAnimated);
                snapper.on('close', onClose);
            }, 0);
            
        }
    };
});

app.directive('radioButtons', function() {
    return {
        restrict: 'AE',
        scope: {
            ngModel: '=',
            values: '=',
            titles: '='
        },
        link: function(scope, elem, attr) {
            var $ul = $('<ul class="tabs-menu"></ul>');
            var valuesAsString = scope.values.map(function(el) {return el.toString()});

            scope.handleItemClick = function(value) {
                scope.ngModel = value;
            };
        },
        template: "<ul class='tabs-menu'><li ng-repeat='value in values' class='tabs-menu-item'" +
            " ng-class='{\"is-active\": ngModel == value}' ng-click='::handleItemClick(value)'>" + 
            "<span>{{::titles[$index]}}</span></li></ul>"
    };
});