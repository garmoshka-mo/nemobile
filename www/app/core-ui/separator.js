(function(){
angular.module("angServices")
    .service('separator',
        ['$q',
function ($q) {

    var TOP_BAR_HEIGHT = 65;
    var COMFORT_CHAT = 140;
    var SMALL_CHAT = 100;
    var LOOK_FOR_CHAT = 135;

    var self = this,
        y = -TOP_BAR_HEIGHT,
        chatIsActive = false,
        animateResize = false;

    var $header = $('#top-bar'),
        $dummy = $('#dummy'),
        $topSection = $('#top-section'),
        $mainSection = $(".main-section"),
        $topFooter = null,
        $bottomFooter = null,
        $window = $(window),
        $dragger = $('#drag-line'),
        edges = {
            left: 0,
            right: $header.width(),
            top: $header.height() - 14
        };

    self.setTopFooter = function($e) {
        $topFooter = $e;
        moveElements();
    };

    self.setBottomFooter = function($e) {
        $bottomFooter = $e;
        moveElements();
    };

    self.updateRestrictions = function() {
        edges.bottom = $window.height() - 17;
        if ($dragger.position().top > $window.height()) {
            y = fullHeight();
            moveElements();
        }
    };

    self.updateView = function(router) {
        chatIsActive = router.isChatActive();

        if (router.top.views.top && router.top.views.top.resize)
            self.resize(router.top.views.top.resize);
        else
            moveElements();
    };

    self.resize = function(height) {
        switch (height) {
            case 'full':
                height = fullHeight();
                break;
            case 'comfortChat':
                height = COMFORT_CHAT - TOP_BAR_HEIGHT;
                break;
            case 'smallChat':
                height = SMALL_CHAT - TOP_BAR_HEIGHT;
                break;
            case 'lookForChat':
                height = LOOK_FOR_CHAT - TOP_BAR_HEIGHT;
                break;
            default:
                height -= TOP_BAR_HEIGHT;
        }

        if (animateResize)
            resizeAnimated(height);
        else {
            animateResize = true;
            y = height;
            moveElements();
        }
    };

    function fullHeight() {
        return y - ($dragger.position().top - $window.height()) - 1;
    }

    function resizeAnimated(height) {
        $dummy.height(y);
        setTimeout(function () {
            $dummy.animate({height: height}, {
                duration: 500,
                progress: function () {
                    y = $dummy.height();
                    moveElements();
                }
            });
        }, 500);
    }

    function moveElements() {
        var showFooter = y > 50 && chatIsActive,
            h = y;

        if (showFooter) {
            $topSection.addClass('with-footer');
        } else {
            $topSection.removeClass('with-footer');
            h = y + TOP_BAR_HEIGHT;
        }

        if (h < 0) h = 0;

        $topSection.height(h);
        if (chatIsActive)
            $topSection.scrollTop($topSection[0].scrollHeight);

        var bottomFooterHeight = $bottomFooter?  $bottomFooter.height() : 0;
        $mainSection.height($window.height() - $dragger.position().top - bottomFooterHeight);

        if ($topFooter) {
            if (showFooter) {
                $topFooter.show();
                $topFooter.css({top: y + 44});
            } else {
                $topFooter.hide();
                $('.disconnect-button').hide();
            }
        }
    }

    self.updateRestrictions();

    new Dragger($dragger, edges);

    function Dragger($e, restriction) {
        var element = $e[0];

        interact(element)
            .draggable({
                inertia: {
                    resistance: 3
                },
                restrict: {
                    restriction: restriction,
                    elementRect: { top: 0, left: 0, bottom: 0, right: 1 }
                }
            })
            .on('dragmove', function (event) {
                y += event.dy;
                moveElements();
            });
    }

}])
})();