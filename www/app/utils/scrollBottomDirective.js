angular.module("angApp").directive('scrollBottom', ['$timeout', function ($timeout) {
    //scrolls to top of element
    return {
        scope: {
            scrollBottom: '='
        },
        restrict: 'A',
        link: function (scope, element, attr) {
            var $container = $('section.main-section');
            scope.$watch('scrollBottom', function(newValue, oldValue) {
                $timeout(function() {
                    var TOP_BAR_HEIGHT = 45;
                    if (newValue) 
                        $container.animate({
                            scrollTop: $container.scrollTop() + $(element).offset().top - TOP_BAR_HEIGHT
                        }, 300);
                }, 0);
            });
        }
    };
 }]);