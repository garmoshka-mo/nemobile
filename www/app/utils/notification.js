(function(){
    services
        .service('notification',
        ['$rootScope', '$timeout', 'sound', 'timer', '$mdToast', Service]);
    function Service($rootScope, $timeout, sound, timer, $mdToast) {
        log("notification service is enabled");
        $rootScope.notification = {
            typing_label: "печатает...",
            time: null
        };

        var initialText;
        var initialHandler;
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
            set: function(title, ava_url, handler) {
                $rootScope.notification.text = title;
                $rootScope.notification.ava_url = ava_url;
                $rootScope.notification.handler = function() {
                    if (handler) handler();
                };
                initialText = title;
                initialHandler = $rootScope.notification.handler;
            },

            typing: function() {
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

            setTemporary: function(text, time, handler) {
                var self = this;
                $rootScope.notification.text = text;
                $rootScope.notification.handler = function() {
                    if (handler) {
                        handler();
                    }
                };
                $rootScope.notification.animated = true;
                time = time || 1000;
                $timeout(
                    function() {
                        if (initialText) {
                            if (initialHandler) {
                                self.set(initialText, initialHandler);
                            }
                            else {
                                self.set(initialText);
                            }
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
                $rootScope.$on('$stateChangeStart', function() {
                    $rootScope.customSmallIconInner =
                        $rootScope.customSmallIconHandler = null;
                });
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
                initialHandler = null;
            },

            setTemporaryPageTitle: function(text) {

                if (suppressingNotifications || RAN_AS_APP || isTabVisible()) {
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
