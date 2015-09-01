(function(){
factories.factory('ExternalProvider',
    ['notification', 'SpamFilter', 'routing', 'api', 'TeacherBot', 'ActivityBot',
function(notification, SpamFilter, routing, api, TeacherBot, ActivityBot) {

    return function ExternalProvider(chat, session, preferences) {
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
            delayTimer,
            filter = new SpamFilter(session),
            teacher = new TeacherBot(provider, filter),
            activity = new ActivityBot(provider);

        var intro = composeIntro(preferences),
            intro_timestamp,
            user_found = false,
            shadow;

        notification.asked = 0;

        function userFound() {
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
            var msg = 'Автофильтр: '+intro;
            intro_timestamp = Date.now();
            provider.Send(msg);
            log('INTRO: '+msg);
            activity.wakeUp();
        }

        function initWithoutIntro() {
            delayTask(function startChatWhenNoHisIntro() {
                filter.log({text: '===начало===', isOwn: true});
                begin_chat();
            }, 2000);
        }

        function gotHisMessage(message) {
            log('Собеседник:');
            log(message);
            activity.calmDown();
            cancelDelayedTask();

            if (shadow) {
                filter.log({text: message, isOwn: false});
                teacher.listen(message);
                return;
            }

            if (!talking && message.substring(0, 11) === 'Автофильтр:') {
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
            if (m.substring(0, 15) === 'Авто-пояснение:')
                return;

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

            filter.log(payload).then(take_decision, begin);

            function take_decision(response) {
                if (response.risk_percent < 50)
                    begin();
                else {
                    log('Shadowing');
                    shadow = true;
                    chat.startNewSession();
                    if (response.is_rude)
                        teacher.explain('dont_be_rude');
                }
            }

            function begin() {
                log('Begin chat');
                begin_chat();
                chat.display_partners_message(message.sanitize());
                teacher.listen(message);
            }

        }

        function begin_chat() {
            talking = true;
            routing.goto('chat', {chatType: 'external', fromState: 'random'});
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
                log('calling display_partners_message');
                chat.display_partners_message({type: 'chat_finished'});
            }
        }

        var timeout = 1, maxTimeout = 8;
        function reconnect() {
            var randomizeTime = true,
                t = timeout + (randomizeTime ? Math.random() * timeout : 0);
            delayTask(connect, t * 1000);
            if (timeout < maxTimeout) timeout = timeout * 2;

            function connect() {
                provider.Connect();
                // Handle stuck effect:
                delayTask(provider.Disconnect, 15 * 1000);
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
        };

        reconnect();
    }

}]);



})();

