(function(){

    var shareTitles = [
        'Поделиться ссылкой:',
        'Sharing is caring 💚:',
        'Делиться-молиться:',
        'Делиться-улыбаться:',
        'Поделиться:',
        'Приколись, поделись:',
        'Делить-колотить:',
        'Понравился чат? Друзьям тоже понравится!',
        'Нравится чат? Расскажи друзьям! ;)'

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