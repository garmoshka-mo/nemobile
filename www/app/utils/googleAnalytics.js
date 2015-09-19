services
    .service('googleAnalytics',
        function () {

            var self = this;

            //properties
            var lookupInProgress = false,
                chatInProgress = false,
                didTry = false,

                dialogStartTime = null,
                dialogDuration = null,
                lookupStartTime = null,
                lookupDuration = null,
                chat20minutesInterval = null,
                dimensions = null;

            //private methods
            function init() {
                if (RAN_AS_APP) {
                    self.executeMobile(function () {
                        window.analytics.startTrackerWithId(config('gaTrackingCodeMobile'));
                    });
                }
                else
                    ga('create', config('gaTrackingCodeWeb'), 'auto');

            }

            function setMetric(number, value) {
                if (RAN_AS_APP) {
                    executeMobile(function () {
                        //TODO: investigate a way to add metrics on mobile app
                        //window.analytics.addCustomMetric('Key', 'Value', success, error)
                    });
                } else {
                    ga('set', 'metric' + number, value);
                }
            }

            function setDimension(number, value) {
                if (RAN_AS_APP) {
                    executeMobile(function () {
                        //TODO: investigate a way to add dimenions on mobile app
                        //window.analytics.addCustomDimension('Key', 'Value', success, error)
                    });
                }
                else {
                    ga('set', 'dimension' + number, value);
                }
            }

            function setDimensions() {
                if (RAN_AS_APP) {
                    executeMobile(function () {
                        //TODO: investigate a way to add dimenions on mobile app
                        //window.analytics.addCustomDimension('Key', 'Value', success, error)
                    });
                }
                else {
                    ga('set', dimensions);
                }
            }

            function unsetDimensions() {
                //According to https://groups.google.com/forum/#!topic/google-analytics-analyticsjs/aes-zOjrNNo
                setDimension(1, '');
                setDimension(2, '');
                setDimension(3, '');
                setDimension(4, '');
                setDimension(5, '');
                setDimension(6, '');
            }

            function unsetMetrics() {
                setMetric(2, '');
                setMetric(3, '');
            }

            function executeMobile(toExecute) {
                if (window.device) {
                    toExecute();
                }
                else {
                    document.addEventListener('deviceready', function () {
                        toExecute();
                    });
                }
            }

            //public methods
            this.event = function (label, value) {
                if (RAN_AS_APP) {
                    executeMobile(function () {
                        window.analytics.trackEvent('send', 'event', label, value);
                    });
                }
                else
                    ga('send', 'event', label, value);
                log(">>>> GA SENT AN EVENT: " + label + " " + value);
            };

            this.setUserPreferences = function (preferences) {
                function toPreference(number) {
                    switch (number) {
                        case -1:
                            return 'forbid';
                        case 0:
                            return 'unselected';
                        case 1:
                            return 'prefer';
                        default :
                            return 'require';
                    }
                }

                dimensions = {
                    'dimension1': preferences.me.gender,
                    'dimension2': preferences.look_for.gender,
                    'dimension3': toPreference(preferences.subjects.sexual),
                    'dimension4': toPreference(preferences.subjects.free_talk),
                    'dimension5': toPreference(preferences.subjects.real),
                    'dimension6': toPreference(preferences.subjects.video)
                };
            };
            this.setLookForChat = function (_lookupInProgress) {
                didTry = true;
                if (_lookupInProgress) {
                    lookupStartTime = Date.now();
                }
                else {
                    lookupDuration = (Date.now() - lookupStartTime) / 1000;
                }
                lookupInProgress = _lookupInProgress;
            };

            //events
            this.pageview = function () {
                if (RAN_AS_APP) {
                    executeMobile(function () {
                        window.analytics.trackView('pageview');
                    });
                }
                else
                    ga('send', 'pageview');
            };
            this.boredToWait = function () {
                lookupInProgress = false;
                self.setLookForChat(false);
                setMetric(2, 0);
                setMetric(3, lookupDuration);
                setDimensions();
                self.event('chatting', 'bored to wait');
                //clean up
                unsetDimensions();
                unsetMetrics();
            };
            this.dialogStart = function () {
                dialogStartTime = Date.now();
                didTry = true;
                chatInProgress = true;
                chat20minutesInterval = self.chat20minutes();
            };
            this.dialogComplete = function () {
                dialogDuration = (Date.now() - dialogStartTime) / 1000;
                if (chat20minutesInterval) {
                    clearInterval(chat20minutesInterval);
                }
                chatInProgress = false;
                setMetric(2, dialogDuration);
                setMetric(3, lookupDuration);
                setDimensions();
                self.event('chatting', 'dialog complete');
                //clean up
                unsetDimensions();
                unsetMetrics();
            };
            this.chat20minutes = function () {
                return setInterval(function () {
                    self.event('chatting', '20 minutes of chatting');
                }, 1200000);
            };

            if (!RAN_AS_APP) {
                (function(i, s, o, g, r, a, m) {
                    i['GoogleAnalyticsObject'] = r;
                    i[r] = i[r] || function() {
                            (i[r].q = i[r].q || []).push(arguments)
                        }, i[r].l = 1 * new Date();
                    a = s.createElement(o),
                        m = s.getElementsByTagName(o)[0];
                    a.async = 1;
                    a.src = g;
                    m.parentNode.insertBefore(a, m)
                })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
            }
            init();
            self.pageview();

            //On page close
            $(window).bind('beforeunload', function() {
                if(lookupInProgress)
                    self.boredToWait();
                else if(chatInProgress)
                    self.dialogComplete();
                else if(!didTry)
                    self.event('chatting', 'didn\'t try');
                self.event('page', 'close');
            });
        });