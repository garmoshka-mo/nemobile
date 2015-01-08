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

app.directive('overscrollableWithFooter', function() {
    return {
        link: function(scope, elem, attr) {
            $(elem).css({
                    "height": "100%",
                    "width": "100%",
                    "padding-right": "15px",
                    "box-sizing": "content-box",
                    "overflow": "auto"
            })
        }
    }
})

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
            })
        }
    }
})