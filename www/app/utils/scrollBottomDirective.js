angular.module("angApp").directive('scrollBottom', ['$timeout', function ($timeout) {
    return {
        scope: {
            scrollBottom: '='
        },
        restrict: 'A',
        link: function (scope, element, attr) {
            var $container = $('section.main-section');
            scope.$watch('scrollBottom', function(newValue, oldValue) {
                $timeout(function() {
                    if (newValue) 
                        $container.animate({
                            scrollTop: $container.scrollTop() + $(element).offset().top - 45
                        }, 300);
                }, 0);
            });
        }
    };
 }]);