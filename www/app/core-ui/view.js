(function(){
angular.module("angServices")
    .service('view',
    ['$state', '$rootScope', 'separator',
function ($state, $rootScope, separator) {

    var $topSection = $("#top-section"),
        $mainSection = $(".main-section"),
        $dragger = $('#drag-line'),
        $window = $(window);

    window.onresize = resizeMainSection;

    $rootScope.$on('$viewContentLoaded', fitNewView);

    function resizeMainSection() {
        setTimeout(function() {
            var $mainFooter = separator.getMainFooter();
            var mainSectionHeight = $window.height() - $dragger.position().top;
            if ($mainFooter) {
                if (mainSectionHeight < 150) {
                    $mainFooter.hide();
                } else {
                    $mainFooter.css({top: $window.height() - ($mainFooter.height() || 64)});
                    $mainFooter.show();
                    mainSectionHeight -= $mainFooter.height();
                }
            }
            $mainSection.height(mainSectionHeight);

        },1);
        separator.updateRestrictions();
    }

    function fitNewView() {
        resizeMainSection();
        scrollToTop();
    }

    this.scrollDownTopSection = function()  {
        $topSection.animate({scrollTop: $topSection[0].scrollHeight}, 500);
    };

    this.scrollToTop = scrollToTop;

    function scrollToTop() {
        $mainSection.scrollTop(0);
    }
}])
})();