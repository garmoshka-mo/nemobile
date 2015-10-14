(function(){

    var shareTitles = [
        'share.title1',
        'share.title2',
        'share.title3',
        'share.title4',
        'share.title5',
        'share.title6',
        'share.title7',
        'share.title8',
        'share.title9'
    ];

    angular.module("angApp").directive('share', function() {
        return {
            link: function(scope, elem, attr) {
                VK.Widgets.Like("vk_like", {type: "full"});

                var i = Math.round(Math.random() * (shareTitles.length - 1));
                scope.shareTitle = shareTitles[i];
                scope.shareColor = randomColor({luminosity: 'dark', hue: 'green'});
                scope.track = 'sh'+i;
                //scope.track = 'test'+i;
            },
            templateUrl: "app/messages/share.html?"+version
        };
    });

})();