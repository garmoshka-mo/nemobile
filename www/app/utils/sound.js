(function () {
    services
        .value('sounds', {
            incomeMessage: new Audio('file:///android_asset/www/assets/sounds/alert.mp3'),
            newConversation: new Audio('file:///android_asset/www/assets/sounds/new_conversation.mp3'),
            // incomeMessage_android: new Media('/android_assets/www/assets/sounds/alert.mp3')
        })
        .service('sound',
        ['sounds', 'deviceInfo',
            function (sounds, deviceInfo) {

                return {
                    isEnabled: function () {
                        return !(localStorage['soundEnabled'] === 'false');
                    },
                    play: function (soundName) {
                        if (deviceInfo.isAndroid) {
                            sounds[soundName + '_android'].play();
                        }
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