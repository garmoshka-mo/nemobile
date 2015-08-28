(function(){
services
    .service('externalChat',
    ['avatars', '$q', 'routing', '$rootScope', 'externalChatSession', 'notification',
    function(avatars, $q, routing, $rootScope, externalChatSession, notification) {

        this.start = function(preferences) {
            this.current_instance = new ExternalChat(preferences);
            this.current_instance.schedule_start();
        };

        this.disconnect = function() {
            if (this.current_instance) this.current_instance.disconnect();
        };

        this.current_instance = new ExternalChat({}); // Empty chat for reloaded page

        function ExternalChat(preferences) {
            var self = this;
            self.chat = null;
            self.talking = false;
            self.provider = null;

            var partner_id = Math.random();
            self.lastUnexpiredChatSession = new externalChatSession(self, partner_id);
            self.chatSessionsIndexes = [self.lastUnexpiredChatSession.id];
            self.ava = avatars.from_id(partner_id);
            self.photoUrl = self.ava.url;
            self.photoUrlMini = self.ava.url_mini;
            self.title = "кто-то";

            var defaultOptions = {
                'onConnect': function(){
                    log('Связь с сервером установлена. Идет соединение с пользователем...');
                },
                'onTyping': function(){
                    notification.typing();
                },
                'onOnline': function(count){
                    log('Сейчас на сайте: '+count);
                },
                'onEnd': function(){
                    log('Собеседник прервал связь');
                }
            };

            self.schedule_start = function() {
                self.start_timer = setTimeout(start, 6000);
            };

            function start() {
                var intro = composeIntro(preferences);
                conversation_initiator(intro);
            }

            function conversation_initiator(intro) {
                self.provider = new Chat(_.extend({
                    onBegin: userFound,
                    onDisconnect: terminated,
                    onReceiveStrangerMessage: got_his_message,
                    onReceiveMyMessage: my_message_sent
                }, defaultOptions));

                var user_found = false;
                function userFound() {
                    if (user_found) return;
                    user_found = true;
                    if (intro.length > 0) {
                        var msg = 'Автофильтр: '+intro;
                        self.provider.Send(msg);
                        log('INTRO: '+msg);
                    } else {
                        begin_chat();
                    }
                }

                function got_his_message(message) {
                    if (!self.talking && message.substring(0, 11) === 'Автофильтр:') {
                        // наш клиент.
                        // Если их не соединило по внутренней сети - то они не подходят друг другу.
                        self.provider.Disconnect();
                    } else {
                        if (!self.talking) begin_chat();
                        display_partners_message(message.sanitize());
                        bot(message);
                    }
                }

                var auto_filter_explained = false;
                function bot(message) {
                    if (!auto_filter_explained && /автофил|фильтр/i.exec(message)) {
                        bot_message('Авто-пояснение: автофильтр - это функция из сайта dub.ink');
                        auto_filter_explained = true;
                    }
                }
                function bot_message(msg) {
                    self.provider.Send(msg);
                    self.lastUnexpiredChatSession.bot_log(msg);
                }

                function begin_chat() {
                    self.lastUnexpiredChatSession.intro(intro);
                    self.talking = true;
                    routing.goto('chat', {chatType: 'external', fromState: 'random'});
                    api.cancelRandomRequest();
                }

                function terminated() {
                    user_found = false;
                    log('terminated. talking="' + self.talking + '"');
                    if (!self.talking) {
                        log('trap into not talking');
                        if (!self.dead) reconnect();
                    } else {
                        log('calling display_partners_message...');
                        display_partners_message({type: 'chat_finished'});
                    }
                }

                var timeout = 2, maxTimeout = 8;
                function reconnect() {
                    setTimeout(self.provider.Connect, timeout * 1000);
                    if (timeout < maxTimeout) timeout = timeout * 2;
                }

                self.provider.Connect();
            }

            self.reportStatusIfInactive = function() {
                if (!(self.provider && self.talking)) {
                    display_partners_message({type: 'chat_empty'});
                }
            };

            function display_partners_message(message) {
                log('Собеседник:');
                log(message);
                setTimeout(function() {
                    $rootScope.$apply(function(){
                        self.lastUnexpiredChatSession.incomeMessage(message);
                    });
                }, 0);
            }

            function my_message_sent(m) {
                if (m.substring(0, 15) === 'Авто-пояснение:')
                    return;

                if (self.talking)
                    self.lastUnexpiredChatSession.my_message_sent(m);
            }

            self.send_my_message = function(m) {
                self.provider.Send(m.escape());
            };

            self.disconnect = function() {
                clearInterval(self.start_timer);
                self.dead = true;
                if (self.provider) self.provider.Disconnect();
            };

            self.getLastUnexpiredChatSession = function() {
                return $q.when(true);
            };

            self.updateInfo = function() {
                return $q.when(true);
            };
        }
    }]);

})();