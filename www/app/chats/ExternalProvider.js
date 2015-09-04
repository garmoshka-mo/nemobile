(function(){
factories.factory('ExternalProvider',
    ['notification', 'SpamFilter', 'api', 'TeacherBot', 'ActivityBot',
        'SlowpokesFriend', 'defaultIntro', 'altIntro',
function(notification, SpamFilter, api, TeacherBot, ActivityBot,
         SlowpokesFriend, defaultIntro, altIntro) {

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
            activity = new ActivityBot(provider),
            slowpokesFriend = new SlowpokesFriend(provider, filter);

        var intro,
            intro_timestamp,
            user_found = false,
            shadow,
            timeout, maxTimeout, timeoutAcceleration;

        // Configure behavior depending on permitted level:
        if (level < 5) { // Veg level:
            timeout = 10 + Math.random()*30;
            maxTimeout = 40; timeoutAcceleration = 4;
            intro = '';
        } else if (level < 10) {
          intro = altIntro.compose(preferences);
          timeout = 3; maxTimeout = 40; timeoutAcceleration = 4;
        } else {
          intro = defaultIntro.compose(preferences);
          timeout = 1; maxTimeout = 30; timeoutAcceleration = 2;
        }

        function reconnect() {
            var randomizeTime = true,
                t = timeout + (randomizeTime ? Math.random() * timeout : 0);
            delayTask(connect, t * 1000);
            if (timeout < maxTimeout) timeout = timeout * timeoutAcceleration;

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

            if (intro.length > 0)
                initWithIntro();
            else
                initWithoutIntro();
        }

        function initWithIntro() {
            var msg = intro;
            intro_timestamp = Date.now();
            provider.Send(msg);
            log('INTRO: '+msg);
            activity.wakeUp();
        }

        function initWithoutIntro() {
            intro_timestamp = Date.now();
            autoBeginTimer = setTimeout(function startChatWhenNoHisIntro() {
                filter.log({text: '===начало===', isOwn: true});
                begin_chat();
            }, 2000);
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

        function decide_to_chat(message) {
            var payload = {
                text: message,
                isOwn: false,
                preferences: preferences,
                intro: {
                    text: intro ? intro : '===начало===',
                    timestamp_ms: intro_timestamp
                }
            };

            filter.log(payload).then(take_decision, filter_passed);

            function take_decision(response) {
                if (response.risk_percent < 50)
                    filter_passed();
                else {
                    log('Shadowing');
                    shadow = true;
                    chat.startNewSession();
                    if (response.is_rude)
                        teacher.explain('dont_be_rude');
                }
            }

            function filter_passed() {
                log('Filter passed');

                if (preferences.look_for.gender != '-' && slowpokesFriend.isSlowpoke(message))
                    return;

                begin_chat();
                chat.display_partners_message(message.sanitize());
                teacher.listen(message);
            }

        }

        function begin_chat() {
            talking = true;
            chat.gotoChat();
            notification.onRandomChatBegin();
            api.cancelRandomRequest();
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
                chat.chatFinished();
            }
        }

        function heTyping() {
            log('he typing...');
            if (shadow) return;

            activity.calmDown();
            notification.typing();
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
            if (provider) provider.Disconnect();
            if (talking) filter.log({text: '===мы закончили===', isOwn: true});
        };

        reconnect();
    }

}]);



})();

