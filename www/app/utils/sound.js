(function () {
    services
        .value('sounds', {
            incomeMessage: new Audio('file:///android_asset/www/assets/sounds/alert.mp3'),
            newConversation: new Audio('file:///android_asset/www/assets/sounds/new_conversation.mp3'),
        })
        .service('sound',
        ['sounds', 'deviceInfo',
            function (sounds, deviceInfo) {

                if (deviceInfo.isAndroid) {
                    sounds.incomeMessage = new Media('file:///android_asset/www/assets/sounds/alert.mp3');
                    newConversation =  new Media('file:///android_asset/www/assets/sounds/new_conversation.mp3');
                }

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