(function(){
    services
        .service('notification',
        ['$rootScope', '$timeout', Service]);
    function Service($rootScope, $timeout) {
        log("notification service is enabled");
        $rootScope.notification = { typing_label: "печатает..." };

        var initialText;
        var initialHandler;
        var incomeMessageSound = new Audio('assets/sounds/alert.mp3');
        var typing_timeout;

        var initialPageTitle = null;
        var initialPageFavicon = null;
        var pageTitleInterval = null;
        var canChangeTitle = true;
        var favicon = new Favico({
            animation : 'popFade',
            bgColor: '#4D6EA3',
            position: 'up'
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

        function supressTitleChange() {
            var TIME_TITLE_SUPRESSED_MSEC = 5000;
            canChangeTitle = false;
            setTimeout(function() {
                canChangeTitle = true;
            }, TIME_TITLE_SUPRESSED_MSEC);
        }

        var newConversationSound = new Audio('assets/sounds/new_conversation.mp3');

        return {
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
                $rootScope.notification.typing = false;
                incomeMessageSound.play();
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
                // console.log(document.webkitVisibilityState);
                // if (document.webkitVisibilityState === "visible" || RAN_AS_APP) {
                //     return;
                // }
                if (!canChangeTitle) {
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
            },

            onRandomChatBegin: function() {
                newConversationSound.play();
                this.setTemporaryPageTitle('Собеседник найден');
                supressTitleChange();
            }


        };
    }

})();
