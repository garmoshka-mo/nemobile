(function(){
    angular.module("angServices")
        .service('notification',
        ['$rootScope', '$timeout', 'sound', 'timer', '$mdToast', Service]);
    function Service($rootScope, $timeout, sound, timer, $mdToast) {
        log("notification service is enabled");
        $rootScope.notification = {
            typing_label: "печатает...",
            time: null
        };

        var initialText;
        var typing_timeout;
        var chatDisconnectHandler;

        var initialPageTitle = null;
        var initialPageFavicon = null;
        var pageTitleInterval = null;
        var suppressingNotifications = false;
        var favicon = new Favico({
            animation : 'popFade',
            bgColor: '#4D6EA3'
        });


        function isTabVisible() {
            var textValue =  
            document.visibilityState ||
            document.webkitVisibilityState;
            return textValue === "visible" ? true : false;
        }
        window.onfocus = function() {
            if (isTabVisible()) {
                resetPageTitle();
            }
            // log('active');
        };

        function setPageTitle(text) {
            document.title = text;
        }

        
        function resetPageTitle() {
            if (pageTitleInterval !== null) {
                setPageTitle(initialPageTitle);
                initialPageTitle = null;
                clearInterval(pageTitleInterval);
                pageTitleInterval = null;
                favicon.reset();
            }
        }

        function startPageTitleInterval(text) {
            pageTitleInterval = setInterval(function() {
                if (document.title === initialPageTitle) {
                    document.title = text;
                    favicon.badge(' ');
                }
                else {
                    document.title = initialPageTitle;
                    favicon.reset();
                }
            }, 1000);
        }

        function suppressTitleChange() {
            var TIME_TITLE_SUPPRESSED_MSEC = 2000;
            suppressingNotifications = true;
            setTimeout(function() {
                suppressingNotifications = false;
            }, TIME_TITLE_SUPPRESSED_MSEC);
        }

        var notification = {
            setTitle: function(title, ava_url) {
                $rootScope.notification.text = title;
                initialText = title;
            },

            typingExternal: function() {
                $rootScope.$apply(function() { $rootScope.notification.typing = true; });
                clearInterval(typing_timeout);
                typing_timeout = setTimeout(function() {
                    $rootScope.$apply(function() { $rootScope.notification.typing = false; });
                }, 2500);
            },

            incomeMessage: function() {
                if (!suppressingNotifications) {
                    log('income message sound is played');
                    $rootScope.notification.typing = false;
                    sound.play('incomeMessage');
                    this.setTemporaryPageTitle('Новое сообщение');
                }
            },

            incrementAsked: function() {
                var self = this;
                $rootScope.$apply(function() { self.asked++; });
            },

            setTemporary: function(text, time) {
                var self = this;
                $rootScope.notification.text = text;
                $rootScope.notification.animated = true;
                time = time || 1000;
                $timeout(
                    function() {
                        if (initialText) {
                            self.setTitle(initialText);
                        }
                        else {
                            self.clear();
                        }
                    },
                    time
                );
            },

            setSmallIcon: function(html, handler) {
                $rootScope.customSmallIconInner = html;
                $rootScope.customSmallIconHandler = handler;
            },

            setChatDisconnectHandler: function(handler){
                chatDisconnectHandler = handler;
            },

            chatDisconnect: function(){
                chatDisconnectHandler();
            },

            showToast: function(message, hideDelay) {
                $mdToast.show(
                    $mdToast.simple()
                        .content(message)
                        .hideDelay(hideDelay || 3000)
                );
            },

            clear: function() {
                $rootScope.notification.text = "";
                $rootScope.notification.animated = false;
                initialText = null;
            },

            setTemporaryPageTitle: function(text) {

                if (suppressingNotifications || IS_APP || isTabVisible()) {
                    return;
                }

                if (pageTitleInterval === null) {
                    initialPageTitle = document.title;
                    startPageTitleInterval(text);
                }
                else {
                    resetPageTitle();
                    initialPageTitle = document.title;
                    startPageTitleInterval(text);
                }
            }
        };

        function onRandomChatBegin() {
            timer.start();
            sound.play('newConversation');
            notification.setTemporaryPageTitle('Собеседник найден');
            suppressTitleChange();
        }

        $rootScope.$on('new random chat', onRandomChatBegin);

        return notification;
    }

})();
