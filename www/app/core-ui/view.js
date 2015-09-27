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
        //var offset = $state.current.hasControlPanel? 110 : 47;
        setTimeout(function() {
            $mainSection.height($window.height() - $dragger.position().top);
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