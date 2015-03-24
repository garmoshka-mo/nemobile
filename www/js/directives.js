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

