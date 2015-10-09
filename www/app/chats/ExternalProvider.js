(function(){
angular.module("angFactories").factory('ExternalProvider',
    ['notification', 'SpamFilter', 'api', 'TeacherBot', 'ActivityBot',
        'SlowpokesFriend', 'defaultIntro', 'altIntro', '$rootScope', 'user',
function(notification, SpamFilter, api, TeacherBot, ActivityBot,
         SlowpokesFriend, defaultIntro, altIntro, $rootScope, user) {

    return function ExternalProvider(chat, session, preferences, level) {
        var provider = new Chat({
            onBegin: userFound,
            onDisconnect: terminated,
            onReceiveStrangerMessage: gotHisMessage,
            onTyping: heTyping,
            'onConnect': function(){ log('Связь с сервером установлена. Идет соединение с пользователем...'); },
            'onOnline': function(count){ log('Сейчас на сайте: '+count); },
            'onEnd': function(){ log('Собеседник прервал связь'); },
            onReceiveMyMessage: myMessageSent
        });

        var self = this,
            talking = false,
            delayTimer, autoBeginTimer,
            filter = new SpamFilter(session),
            teacher = new TeacherBot(provider, filter),
            activity = new ActivityBot(provider, function() {
                teacher.partnerLeft = true;
                shadowing();
            }),
            slowpokesFriend = new SlowpokesFriend(provider, filter);

        var allowEmergencyThrow = false, maxEmergencyThrows = 4, emergencyTimer, emergencyThrowActivated = false;
        if (!user.emergencyThrowsCount) user.emergencyThrowsCount = 0;

        var intro,
            intro_timestamp,
            user_found = false,
            shadow, fellIntoPit,
            timeout, maxBaseTimeout, timeoutAcceleration;

        // Configure behavior depending on permitted level:
        if (level < 5) { // Veg level:
            timeout = 10 + Math.random()*20;
            maxBaseTimeout = 10; timeoutAcceleration = 1;
            intro = '';
            fellIntoPit = true;
        } else if (level < 10) {
            intro = altIntro.compose(preferences);
            timeout = 3; maxBaseTimeout = 40; timeoutAcceleration = 4;
        } else {
            intro = defaultIntro.compose(preferences);
            timeout = 1; maxBaseTimeout = 5; timeoutAcceleration = 2;
            allowEmergencyThrow = user.emergencyThrowsCount < maxEmergencyThrows;
        }

        log('Initialized', level, timeout);

        function startLookup() {
            reconnect();
            if (allowEmergencyThrow)
                emergencyTimer = setTimeout(emergencyThrow, 30 * 1000);
        }

        function emergencyThrow() {
            intro = '';
            emergencyThrowActivated = true;
            user.emergencyThrowsCount++;
            log('emergencyThrowActivated');
        }

        function reconnect() {
            var randomizeTime = true,
                t = timeout + (randomizeTime ? Math.random() * timeout : 0);
            delayTask(connect, t * 1000);
            if (timeout < maxBaseTimeout) timeout = timeout * timeoutAcceleration;

            function connect() {
                provider.Connect();
                // Handle stuck effect:
                log('Launch stuck protector');
                delayTask(function() {
                    log('Escape from stuck!');
                    provider.Disconnect();
                }, 15 * 1000);
            }
        }

        function userFound() {
            log('userFound');
            cancelDelayedTask();

            if (user_found) return;
            user_found = true;

            notification.incrementAsked();

            intro_timestamp = Date.now();

            if (intro.length > 0) initWithIntro();
            else initWithoutIntro();
        }

        function initWithIntro() {
            provider.Send(intro);
            log('INTRO: '+intro);
            activity.wakeUp();
        }

        function initWithoutIntro() {
            function startChatWhenNoHisIntro() {
                if (fellIntoPit)
                    logTagAndBegin('🚨WELCOME TO HELL🚨');
                if (emergencyThrowActivated)
                    logTagAndBegin('🚨Emergency throw🚨');
                else
                    logTagAndBegin('открылся чат, вступления нет');
            }
            autoBeginTimer = setTimeout(startChatWhenNoHisIntro, 2000);
        }

        function logTagAndBegin(tag) {
            firstMessageToFilter('==='+tag+'===', true, false);
            beginСhat();
        }

        function firstMessageToFilter(message, isOwn, skip_log) {
            var payload, talk_params;

            payload = {
                text: message,
                isOwn: isOwn,
                skip_log: skip_log,
                preferences: preferences
            };

            if (intro) payload.intro = { text: intro, timestamp_ms: intro_timestamp };

            talk_params = {
                a: {
                    client_id: user.uuid,
                    level: level,
                    request_created_ms: chat.created_at,
                    preferences: preferences
                }
            };

            return filter.log(payload, talk_params);
        }

        function gotHisMessage(message) {
            log('Собеседник:');
            log(message);
            activity.calmDown();
            clearInterval(autoBeginTimer);

            if (shadow) {
                filter.log({text: message, isOwn: false});
                teacher.listen(message);
                return;
            }

            if (!talking &&
                (message.startsWith('Автоматический фильтр:') ||
                    message.startsWith('Автофильтр:') ||
                    message.startsWith('ищу:'))) {
                // наш клиент.
                // Если их не соединило по внутренней сети - то они не подходят друг другу.
                log('Internal user - disconnecting.');
                provider.Disconnect();
            } else {
                if (!talking)
                    decide_to_chat(message);
                else {
                    chat.display_partners_message(message.sanitize());
                    teacher.listen(message);
                }
            }
        }

        function myMessageSent(m) {
            if (m.startsWith('Автоматическое пояснение:')) return;

            if (talking)
                session.myMessageSent(m);
        }

        function shadowing() {
            log('Shadowing');
            shadow = true;
            chat.startNewSession();
        }

        function decide_to_chat(message) {

            if (fellIntoPit)
                allowConversation();
            else
                firstMessageToFilter(message, false, true).then(take_decision, filterPassed);

            function take_decision(response) {
                if (response.risk_percent < 50)
                    filterPassed();
                else {
                    shadowing();
                    if (response.is_rude)
                        teacher.explain('dont_be_rude');
                }
            }

            function filterPassed() {
                log('Filter passed. Do slowpoke');

                if (preferences.look_for.gender != '-' && slowpokesFriend.isSlowpoke(message))
                    return;

                allowConversation();
            }

            function allowConversation() {
                beginСhat();
                chat.display_partners_message(message.sanitize());
                teacher.listen(message);
            }
        }

        function beginСhat() {
            clearInterval(emergencyTimer);
            $rootScope.$broadcast('new random chat', {type: 'external'});
            talking = true;
        }

        function terminated() {
            user_found = false;
            activity.calmDown();

            if (shadow) return;

            log('terminated. talking="' + talking + '"');
            if (!talking) {
                log('trap into not talking');
                reconnect();
            } else {
                talking = false; shadow = true;
                log('calling display_partners_message');
                chat.partnerTerminated();
            }
        }

        function heTyping() {
            log('he typing...');
            if (shadow) return;

            activity.calmDown();
            notification.typingExternal();
        }

        function delayTask(callback, timeout) {
            delayTimer = setTimeout(callback, timeout);
        }

        function cancelDelayedTask() {
            log('cancelDelayedTask');
            clearInterval(delayTimer);
        }

        self.send = function(m) {
            provider.Send(m.escape());
        };

        self.typing = function() {
            if (provider) provider.Typing();
        };

        self.quit = function() {
            shadow = true;
            cancelDelayedTask();
            activity.calmDown();
            clearInterval(autoBeginTimer);
            if (provider) provider.Disconnect();
            if (talking) filter.log({text: '===кончина===', isOwn: true});
        };

        startLookup();
    };

}]);



})();
