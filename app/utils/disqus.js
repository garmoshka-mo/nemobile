(function(){
    angular.module("angServices")
        .service('disqus',
        ['$rootScope',
    function($rootScope) {

        this.load = function(id, title) {
            if (window.DISQUS)
                DISQUS.reset({
                    reload: true,
                    config: function () {
                        this.page.identifier = id;
                        this.page.title = title;
                        this.page.url = window.location.href;
                    }
                });
            else
                init(id);
        };

        function init(id) {
            window.disqus_shortname = 'dubink';
            window.disqus_identifier = id;
            window.disqus_url = window.location.href;

            // Disqus:
            (function() {
                var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
                dsq.src = '//' + window.disqus_shortname + '.disqus.com/embed.js';
                (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
            })();
        }

    }]);

})();