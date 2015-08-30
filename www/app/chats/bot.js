(function(){
factories.factory('Bot',
    ['notification', 'spamFilter', 'routing', 'api',
function(notification, spamFilter, routing, api) {

    return function Bot(chat, session) {
        chat.provider = new Chat({
            onBegin: userFound,
            onDisconnect: terminated,
            onReceiveStrangerMessage: got_his_message,
            onTyping: typing,
            'onConnect': function(){ log('Связь с сервером установлена. Идет соединение с пользователем...'); },
            'onOnline': function(count){ log('Сейчас на сайте: '+count); },
            'onEnd': function(){ log('Собеседник прервал связь'); },
            onReceiveMyMessage: myMessageSent
        });

        var self = this,
            talking = false,
            boredom_timer,
            start_timer;

        var intro = composeIntro(chat.preferences),
            intro_timestamp,
            user_found = false,
            shadow;

        function userFound() {
            if (user_found) return;
            user_found = true;
            if (intro.length > 0) {
                var msg = 'Автофильтр: '+intro;
                intro_timestamp = Date.now();
                chat.provider.Send(msg);
                log('INTRO: '+msg);
                boredom_timer = setTimeout(becomeBored, 5 * 1000);
            } else {
                bot_log('===начало===');
                begin_chat();
            }
        }

        function becomeBored() {
            chat.provider.Send('ау');
            boredom_timer = setTimeout(becomeTooBored, 5 * 1000);
        }

        function becomeTooBored() {
            chat.provider.Disconnect();
        }

        function got_his_message(message) {
            if (shadow) {
                spamFilter.filter(session, message);
                give_to_bot(message);
                return;
            }

            if (!talking && message.substring(0, 11) === 'Автофильтр:') {
                // наш клиент.
                // Если их не соединило по внутренней сети - то они не подходят друг другу.
                chat.provider.Disconnect();
            } else {
                if (!talking)
                    decide_to_chat(message);
                else {
                    chat.display_partners_message(message.sanitize());
                    give_to_bot(message);
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
                isOwn: true,
                preferences: chat.preferences,
                intro: {
                    text: intro,
                    timestamp_ms: intro_timestamp
                }
            };

            spamFilter.filter(session, payload, take_decision);
            function take_decision(response) {
                if (response.risk_percent > 50) {
                    shadow = true;
                    chat.startNewSession();
                } else {
                    begin_chat();
                    chat.display_partners_message(message.sanitize());
                    give_to_bot(message);
                }
            }
        }


        var auto_filter_explained = false;
        function give_to_bot(message) {
            if (!auto_filter_explained && /автофил|фильтр/i.exec(message)) {
                bot_message('Авто-пояснение: автофильтр - это функция из сайта dub.ink');
                auto_filter_explained = true;
            }
        }
        function bot_message(msg) {
            chat.provider.Send(msg);
            bot_log(msg);
        }

        function bot_log(msg) {
            spamFilter.filter(session, {text: msg, isOwn: true});
        }

        function begin_chat() {
            talking = true;
            routing.goto('chat', {chatType: 'external', fromState: 'random'});
            api.cancelRandomRequest();
        }

        function terminated() {
            user_found = false;

            if (shadow) return;

            log('terminated. talking="' + talking + '"');
            if (!talking) {
                log('trap into not talking');
                reconnect();
            } else {
                log('calling display_partners_message...');
                chat.display_partners_message({type: 'chat_finished'});
            }
        }

        var timeout = 1, maxTimeout = 8;
        function reconnect() {
            start_timer = setTimeout(chat.provider.Connect, timeout * 1000);
            if (timeout < maxTimeout) timeout = timeout * 2;
        }

        function typing() {
            if (shadow) return;

            clearInterval(boredom_timer);
            notification.typing();
        }

        self.quit = function() {
            shadow = true;
            clearInterval(start_timer);
            clearInterval(boredom_timer);
        };

        reconnect();
    }

}]);



})();

