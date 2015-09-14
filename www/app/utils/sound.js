(function () {
    services
        .service('sound',
        ['deviceInfo',
            function (deviceInfo) {

                var sounds = {};
                if (deviceInfo.isAndroid) {
                    sounds.incomeMessage = new Media('file:///android_asset/www/assets/sounds/alert.mp3');
                    sounds.newConversation =  new Media('file:///android_asset/www/assets/sounds/new_conversation.mp3');
                }
                else {
                    sounds.incomeMessage = new Audio('assets/sounds/alert.mp3');
                    sounds.newConversation =  new Audio('assets/sounds/new_conversation.mp3');
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