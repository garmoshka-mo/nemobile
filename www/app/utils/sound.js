(function () {
    services
        .value('sounds', {
            enabled: true,

            incomeMessage: new Audio('assets/sounds/alert.mp3'),
            newConversation: new Audio('assets/sounds/new_conversation.mp3')
        })
        .service('sound',
        ['sounds',
            function (sounds) {
                return {
                    play: function (soundName) {
                        if (sounds.enabled) {
                            sounds[soundName].play();
                        }
                    },
                    isEnabled: function () {
                        return sounds.enabled;
                    },
                    toggle: function () {
                        sounds.enabled = !sounds.enabled
                    }
                };
            }]);
})();