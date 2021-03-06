angular.module("angApp")

.directive('stopEvent', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            element.bind("click touchstart", function (e) {
                e.stopPropagation();
            });
        }
    };
 })

.directive('stopEventPrevent', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            element.bind("click touchstart", function (e) {
                e.stopPropagation();
                e.preventDefault();
            });
        }
    };
 })

.directive('stickersGalleryHeight', function() {

    $(function() {
        window.BODY_HEIGHT = $('body').height();
        window.TAB_BAR_HEIGHT = $('#tob-bar').height();
    });

    return {
        link: function(scope, elem, attr) {

            // log("top bar height: ", emPixels * topBarHeight_rem);
            // log("chat keyboard height: ", $('.chat-buttons-container').height());
            
            var INPUT_FIELD_HEIGHT = 72;
            var KEYBOARD_PADDING = 20;
            var IPHONE_TOP_BAR_HEIGHT = 20;

            var stickersGalleryHeight = BODY_HEIGHT - TAB_BAR_HEIGHT - INPUT_FIELD_HEIGHT - KEYBOARD_PADDING; 
            
            if (IS_APP) {
                if (device.platform == "iOS") {
                    stickersGalleryHeight = stickersGalleryHeight - IPHONE_TOP_BAR_HEIGHT;
                }
            }

            $(elem).height(stickersGalleryHeight);
        }
    };
})

.directive('imageonload', function() {
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
})

.directive('npTouchstart', function() {
    return {
        link: function(scope, elem, attr) {
            $(elem).on("click touchstart", function() {
                scope[attr.npTouchstart]();
            });
        }
    };
})

.directive('spinner', function() {
    return {
        template: '<div class="spinner"><div class="dot bounce1"></div><div class="dot bounce2"></div><div class="dot bounce3"></div></div>',
        link: function(scope, elem, attr) {
            var dots = $(elem).find(".dot");
            dots.addClass(attr.spinnerColor || "black");
        }
    };
})

.directive('clearAllButton', function() {
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
                // log("clicked");
                scope.ngModel = "";
                scope.$apply();
                elem.focus();
            });
            // $clearButton.hide();
            // $(elem).on('focus', function() {
            //     $clearButton.show();
            // });
            // $(elem).on('blur', function(event) {
            //     log('blurred');
            
            //     setTimeout(function() {$clearButton.hide()},250);
            // });
        }
    };
})

.directive('clearAllButtonInline', function() {
    return {
        scope: {
            ngModel: "="
        },
        link: function(scope, elem, attr) {
            var $clearButton = $("<div class='clear-all-button clear-all-button-inline'><i class='fa fa-close'></i></div>");
            $(elem).css({'padding-right':'22px'});
            $clearButton.insertAfter(elem);
            $clearButton.click(function () {
                // log("clicked");
                scope.ngModel = "";
                scope.$apply();    
            });
        }
    };
})

.directive('alertBox', function() {
    return {
        template: '<div ng-show="ngModel" data-alert class="alert-box warning no-transition"><span ng-bind="ngModel"></span><span ng-click="close()" class="close pointer">&times;</span></div>',
        scope: {
            ngModel: "="
        },
        link: function(scope, elem, attr) {
            scope.close = function() {
                log("closed");
                scope.ngModel = '';
            };       
        }
    };
})

.directive('radioButtons', function() {
    return {
        restrict: 'AE',
        scope: {
            ngModel: '=',
            values: '=',
            titles: '='
        },
        link: function(scope, elem, attr) {
            var valuesAsString = scope.values.map(function(el) {return el.toString();});

            scope.handleItemClick = function(value) {
                scope.ngModel = value;
            };
        },
        template: "<ul class='tabs-menu'><li ng-repeat='value in values' class='tabs-menu-item'" +
            " ng-class='{\"is-active\": ngModel == value}' ng-click='::handleItemClick(value)'>" + 
            "<span>{{::titles[$index]}}</span></li></ul>"
    };
})

.directive('sexSelect', function() {
    return {
        restrict: 'AE',
        scope: {
            ngModel: '='
        },

        link: function(scope, elem, attr) {
            scope.handleItemClick = function(value) {
                var previousChoice = scope.ngModel;
                if(previousChoice === value)  {
                    scope.ngModel = "-";
                }
                else if (previousChoice === 'mw') {
                    scope.ngModel = value == 'm'? 'w' : 'm';
                }
                else if('multiSelect' in attr && previousChoice !== '-') {
                    scope.ngModel = 'mw';
                }
                else {
                    scope.ngModel = value;
                }
            };
        },

        template: "<ul class='sex-select'>" +
            "<li class='sex-select-li man' " +
            "ng-class='{\"selected\": ngModel == \"m\" || ngModel == \"mw\"}' ng-click='handleItemClick(\"m\")'></li>" +
            "<li ng-click='handleItemClick(\"w\")' class='sex-select-li woman' " + 
            "ng-class='{\"selected\": ngModel == \"w\" || ngModel == \"mw\"}'></li></ul>"
    };
})

.directive('allowTextSelect', function() {
    return {
        restrict: 'A',
        link: function(scope, elem, attr) {
            if (!IS_APP) {
                angular.element(elem).attr('data-snap-ignore', true);
            }
        }
    };
})

.directive('selectOnClick', function () {
    // Linker function
    return function (scope, element) {
        element.bind('click', function () {
            this.select();
        });
    };
});
