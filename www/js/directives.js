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

app.directive('overscrollableWithoutFooter', function() {
    return {
        link: function(scope, elem, attr) {
            var emPixels = getEmPixels();
            var bodyHeight = $('body').height();
            var topBarHeight_rem = 2.8125;
            $(elem).height(bodyHeight - emPixels * topBarHeight_rem);
            $(elem).css({
                  "width": "100%",
                  "padding-right": "15px",
                  "box-sizing": "content-box",
                  "overflow": "auto"
            });
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

app.directive('stickersGalleryHeight', function() {
    return {
        link: function(scope, elem, attr) {
            var emPixels = getEmPixels();
            var bodyHeight = $('body').height();
            var topBarHeight_rem = 2.8125;

            // console.log("top bar height: ", emPixels * topBarHeight_rem);
            // console.log("chat keyboard height: ", $('.chat-buttons-container').height());
            
            var INPUT_FIELD_HEIGHT = 72;
            var KEYBOARD_PADDING = 20;
            var IPHONE_TOP_BAR_HEIGHT = 20;

            var stickersGalleryHeight = bodyHeight - emPixels * topBarHeight_rem - INPUT_FIELD_HEIGHT - KEYBOARD_PADDING; 
            
            if (window.device) {
                if (device.platform == "iOS") {
                    stickersGalleryHeight = stickersGalleryHeight - IPHONE_TOP_BAR_HEIGHT;
                }
            }

            $(elem).height(stickersGalleryHeight);
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
            $(elem).css({'padding-right':'30px'});
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
            $(elem).css({'padding-right':'30px'});
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
            var innerWrap = $(".inner-wrap")[0];
            var offCanvasWrap = $(".off-canvas-wrap")[0];
            var hammertime = new Hammer(innerWrap, {});
            var END_X = 245;
            var BEGINING_X = 0;
            var isOpenning = false;
            var currentTransform; 
            
            function close() {
                $(offCanvasWrap).removeClass('move-right');
                $(innerWrap).css('transform', '');
            }

            function open() {
                // console.log('is openning');
                $(innerWrap).css({"transform": "translate3d(" + END_X + "px, 0, 0)"});
                $(offCanvasWrap).addClass('move-right');
                // $(innerWrap).css({"transform": ""});
            }

            function onEnd() {
                // console.log('ended');
                $(innerWrap).removeClass('no-transition');
                // console.log(isOpenning);
                if (isOpenning) {
                    open();
                }
                else {
                    close();
                }
            }

            var exitOffCanvas = $(".exit-off-canvas")[0]; 
            $(exitOffCanvas).off();
            $(exitOffCanvas).on('click touchstart', function() {
                $(innerWrap).removeClass('no-transition');
                close();
            });

             $(document).on('click touchstart', '.off-canvas-list', function() {
                $(innerWrap).removeClass('no-transition');
                close();
            });


            hammertime.on('pan', function(ev) {
                if (-15 < ev.angle < 15) {
                    $(innerWrap).addClass('no-transition');
                    var cssTransform = +$(innerWrap).css("transform");
                    if (cssTransform) {
                        currentTransform = +$(innerWrap).css("transform").match(/matrix\(\d+, \d+, \d+, \d+, (\d+), \d+\)/)[1];
                    }
                    else {
                        currentTransform = BEGINING_X;
                    }
                    // console.log(ev);
                    isOpenning = ev.deltaX > 0 ? true : false;
                    var pxTransform = currentTransform + ev.deltaX;
                    pxTransform = pxTransform < BEGINING_X ? BEGINING_X : pxTransform;
                    pxTransform = pxTransform > END_X ? END_X : pxTransform;
                    // console.log(pxTransform);
                    $(innerWrap).css({"transform": "translate3d(" + pxTransform + "px, 0, 0)"});
                    if (ev.srcEvent.type === "touchend") {
                        onEnd();
                    }
                }
            }); 
        }
    };
});