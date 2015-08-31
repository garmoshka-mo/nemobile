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
            start_timer,
            filter = new SpamFilter(session),
            teacher = new TeacherBot(provider, filter),
            activity = new ActivityBot(provider);

        var intro = composeIntro(preferences),
            intro_timestamp,
            user_found = false,
            shadow;

        function userFound() {
            if (user_found) return;
            user_found = true;
            if (intro.length > 0) {
                var msg = 'Автофильтр: '+intro;
                intro_timestamp = Date.now();
                provider.Send(msg);
                log('INTRO: '+msg);
                activity.wakeUp()
            } else {
                filter.log({text: '===начало===', isOwn: true});
                begin_chat();
            }
        }

        function gotHisMessage(message) {
            log('Собеседник:');
            log(message);
            activity.calmDown();

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
                    text: intro,
                    timestamp_ms: intro_timestamp
                }
            };

            filter.log(payload, take_decision);
            function take_decision(response) {
                if (response.risk_percent > 50) {
                    log('Shadowing');
                    shadow = true;
                    chat.startNewSession();
                    if (response.is_rude)
                        teacher.explain('dont_be_rude');
                } else {
                    log('Begin chat');
                    begin_chat();
                    chat.display_partners_message(message.sanitize());
                    teacher.listen(message);
                }
            }
        }

        function begin_chat() {
            talking = true;
            routing.goto('chat', {chatType: 'external', fromState: 'random'})
            .then(
                function() {
                    notification.onRandomChatBegin();
                }
            );
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
            start_timer = setTimeout(provider.Connect, timeout * 1000);
            if (timeout < maxTimeout) timeout = timeout * 2;
        }

        function heTyping() {
            log('he typing...');
            if (shadow) return;

            activity.calmDown();
            notification.typing();
        }

        self.send = function(m) {
            provider.Send(m.escape());
        };

        self.typing = function() {
            if (provider) provider.Typing();
        };

        self.quit = function() {
            shadow = true;
            clearInterval(start_timer);
            activity.calmDown();
            if (provider) provider.Disconnect();
        };

        reconnect();
    }

}]);



})();

