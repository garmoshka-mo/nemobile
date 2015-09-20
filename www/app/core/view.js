(function(){
angular.module("angServices")
    .service('view',
    ['$state', '$rootScope', Service]);
function Service($state, $rootScope) {

    var $mainSection = $(".main-section"),
        $window = $(window);

    $(window).resize(resizeMainSection);

    $rootScope.$on('$viewContentLoaded', fitNewView);

    function resizeMainSection() {
        var offset = $state.current.hasChatView? 110 : 47;
        setTimeout(function() {
            $mainSection.height($window.height() - offset + 'px');
        },1);
    }

    function fitNewView() {
        resizeMainSection();
        scrollToTop();
    }

    this.scrollToTop = scrollToTop;

    function scrollToTop() {
        $mainSection.scrollTop(0);
    }
}

})();