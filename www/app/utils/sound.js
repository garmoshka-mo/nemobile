(function () {
    services
        .value('sounds', {
            incomeMessage: new Audio('/android_assets/www/assets/sounds/alert.mp3'),
            newConversation: new Audio('/android_assets/www/assets/sounds/new_conversation.mp3')
        })
        .service('sound',
        ['sounds',
            function (sounds) {

                return {
                    isEnabled: function () {
                        return !(localStorage['soundEnabled'] === 'false');
                    },
                    play: function (soundName) {
                        if (this.isEnabled()) {
                            sounds[soundName].play();
                        }
                    },
                    toggle: function () {
                        return localStorage.setItem('soundEnabled', !this.isEnabled());
                    }
                };
            }]);
})();