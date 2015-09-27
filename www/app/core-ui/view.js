(function(){
angular.module("angServices")
    .service('view',
    ['$state', '$rootScope', 'separator',
function ($state, $rootScope, separator) {

    var $mainSection = $(".main-section"),
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

    this.scrollToTop = scrollToTop;

    function scrollToTop() {
        $mainSection.scrollTop(0);
    }
}])
})();