(function(){

    var shareTitles = [
        'Поделиться ссылкой:',
        'Sharing is caring:',
        'Делиться-молиться:',
        'Делиться-улыбаться:',
        'Поделиться:',
        'Понравился чат? Друзьям тоже понравится:',
        'Нравится чат? Расскажите друзьям! ;)'

    ];

    app.directive('share', function() {
        return {
            link: function(scope, elem, attr) {
                VK.Widgets.Like("vk_like", {type: "full"});
                pluso.start();
                var i = Math.round(Math.random() * (shareTitles.length - 1));
                scope.shareTitle = shareTitles[i];
            },
            templateUrl: "app/messages/share.html"
        };
    });

})();