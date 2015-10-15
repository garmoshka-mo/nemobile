(function(){
angular.module("angServices")
    .service('separator',
        ['googleAnalytics',
function (googleAnalytics) {

    var TOP_BAR_HEIGHT = 65;
    var COMFORT_CHAT = 140;
    var SMALL_CHAT = 100;

    var self = this,
        y = -TOP_BAR_HEIGHT,
        chatIsActive = false,
        animateResize = false,
        resizedByUser = false,
        visible = true;

    var $header = $('#top-bar'),
        $dummy = $('#dummy'),
        $topSection = $('#top-section'),
        $mainSection = $(".main-section"),
        $topFooter = null,
        $mainFooter = null,
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

    self.getMainFooter = function() {
        return $mainFooter;
    };

    self.setMainFooter = function($e) {
        $mainFooter = $e;
        moveElements();
    };

    self.updateRestrictions = function() {
        edges.bottom = $window.height() - 17;
        if ($dragger.position().top > $window.height()) {
            y = fullHeight() - 65;
            resizedByUser = false;
            moveElements();
        }
    };

    self.updateView = function(router) {
        chatIsActive = router.isChatActive();

        var t = router.top.views.top;
        if (t && t.resize && !(t.unforcedResize && resizedByUser)) {
            if (t.animated) animateResize = true;
            self.resize(t.resize);
        } else
            moveElements();
    };

    self.unforcedResize = function(height) {
        if (!resizedByUser) self.resize(height);
    };

    self.isVisible = function() {
        return visible;
    };

    self.resize = function(height, disableAnimation) {
        resizedByUser = false;
        visible = true;
        $dragger.show();
        switch (height) {
            case 'full':
                height = fullHeight();
                break;
            case 'comfortChat':
                height = COMFORT_CHAT;
                break;
            case 'smallChat':
                height = SMALL_CHAT;
                break;
            case 'hide':
                $dragger.hide();
                height = 0;
                visible = false;
                break;
        }
        if (disableAnimation) {
            animateResize = false;
        }

        if (animateResize)
            resizeAnimated(height);
        else {
            animateResize = true;
            resizeQuickly(height);
        }
    };

    function fullHeight() {
        return y - ($dragger.position().top - $window.height()) + TOP_BAR_HEIGHT - 1;
    }

    function resizeQuickly(height) {
        y = height - TOP_BAR_HEIGHT;
        moveElements();
    }

    function resizeAnimated(height) {
        $dummy.height(y + TOP_BAR_HEIGHT);
        setTimeout(function () {
            $dummy.animate({height: height}, {
                duration: 500,
                progress: function () {
                    y = $dummy.height() - TOP_BAR_HEIGHT;
                    moveElements();
                }
            });
        }, 500);
    }

    function showFooter(footer, showWhen, positionTop) {
        if (footer) {
            if (showWhen) {
                footer.show();
                footer.css({top: positionTop});
            } else {
                footer.hide();
                $('.disconnect-button').hide();
            }
        }
    }

    function moveElements() {
        var showTopFooter = y > 50 && chatIsActive,
            showMainFooter = true,
            h = y;

        if (showTopFooter) {
            $topSection.addClass('with-footer');
        } else {
            $topSection.removeClass('with-footer');
            h = y + TOP_BAR_HEIGHT;
        }

        if (h < 0) h = 0;

        $topSection.height(h);
        if (chatIsActive)
            $topSection.scrollTop($topSection[0].scrollHeight);

        var mainSectionHeight = $window.height() - $dragger.position().top;
        if($mainFooter && mainSectionHeight >= 150) {
            mainSectionHeight -= $mainFooter.height();
        } else {
            showMainFooter = false;
        }
        $mainSection.height(mainSectionHeight);

        showFooter($topFooter, showTopFooter, y + 46);
        if($mainFooter) {
            var footerHeight =  $mainFooter.height() || 64;
            showFooter($mainFooter, showMainFooter, $window.height() - footerHeight );
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
                resizedByUser = true;
                y += event.dy;
                googleAnalytics.dragSeparator(y);
                moveElements();
            });
    }

}])
})();