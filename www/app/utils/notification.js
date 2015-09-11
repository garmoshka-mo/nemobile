(function(){
    services
        .service('notification',
        ['$rootScope', '$timeout', Service]);
    function Service($rootScope, $timeout) {
        log("notification service is enabled");
        $rootScope.notification = {
            typing_label: "печатает...",
            time: null
        };

        var initialText;
        var initialHandler;
        var incomeMessageSound = new Audio('assets/sounds/alert.mp3');
        var typing_timeout;

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

       

        var newConversationSound = new Audio('assets/sounds/new_conversation.mp3'),
            timer;

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

            startTimer: function() {
                notification.resetTimer();
                var start = Date.now();
                timer = setInterval(function() {
                    var duration = (Date.now() - start) / 1000;
                    $rootScope.$apply(function(){
                        $rootScope.notification.time = duration.toHHMMSS();
                    });
                }, 1000);
            },
            stopTimer: function() {
                clearInterval(timer);
            },
            resetTimer: function() {
                clearInterval(timer);
                $rootScope.notification.time = "";
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
                    incomeMessageSound.play();
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
            notification.startTimer();
            log('new random chat sound is played');
            newConversationSound.play();
            notification.setTemporaryPageTitle('Собеседник найден');
            suppressTitleChange();
        }

        $rootScope.$on('new random chat', onRandomChatBegin);

        return notification;
    }

})();
