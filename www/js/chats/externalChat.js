(function(){
services
    .service('externalChat',
    ['avatars', '$q', 'routing', '$rootScope', 'externalChatSession', ExternalChat]);
    function ExternalChat(avatars, $q, routing, $rootScope, externalChatSession) {

    // ToDo:  прикутить отправку уведомления о печатаньи на внешний чат!
    //chat.Typing() - Отправляет собеседнику сообщение о том, что вы печатаете

        var self = this;
        self.chat = null;
        self.talking = false;
        self.lastUnexpiredChatSession = null;
        self.provider = null;

        var defaultOptions = {
            'onConnect': function(){
                console.log('Связь с сервером установлена. Идет соединение с пользователем...');
            },
            'onTyping': function(){
                console.log('Собеседник печатает сообщение...');
            },
            'onOnline': function(count){
                console.log('Сейчас на сайте: '+count);
            },
            'onEnd': function(){
                console.log('Собеседник прервал связь');
            }
        };

        self.start = function(preferences) {
            self.preferences = preferences;
            self.start_timer = setTimeout(start, 4000);
        };

        function start() {
            self.talking = false;

            var intro = composeIntro(self.preferences);
            if (intro.length < 1) intro = '..';
            conversation_machine(intro);
        }

        function conversation_machine(intro) {
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
                self.provider.Send(intro);
                console.log('Intro: '+intro);
            }

            function got_his_message(message) {
                console.log('Сообщение от незнакомца: "'+message+'"');
                if (!self.talking) begin_chat();
                display_partners_message(message.sanitize());
            }

            function begin_chat() {
                self.talking = true;
                reinit_chat();
                routing.goto('chat', {chatType: 'external', fromState: 'random'});
                api.cancelRandomRequest();
            }

            function terminated() {
                user_found = false;
                console.log('terminated. talking="' + self.talking + '"');
                if (!self.talking)
                    self.provider.Connect();
                else
                    display_partners_message('<b>Собеседник покинул чат</b> <a href="#/random">Начать новый диалог</a>');
            }

            self.provider.Connect();
        }

        self.reportStatusIfInactive = function() {
            if (!(self.provider && self.talking)) {
                display_partners_message('<b>Этот чат завершен</b> <a href="#/random">Начать новый диалог</a>');
            }
        };

        function display_partners_message(messageText) {
            setTimeout(function() {
                $rootScope.$apply(function(){
                    self.lastUnexpiredChatSession.messages.push({
                        text: messageText,
                        isOwn: false
                    });
                });
            }, 0);
        }

        function my_message_sent(m) {
            if (self.talking)
                self.lastUnexpiredChatSession.my_message_sent(m);
        }

        function reinit_chat() {
            var partner_id = Math.random();
            self.lastUnexpiredChatSession =
                externalChatSession.get_new_session(self, partner_id);
            self.chatSessionsIndexes = [self.lastUnexpiredChatSession.id];
            self.ava = avatars.from_id(partner_id);
            self.photoUrl = self.ava.url;
            self.photoUrlMini = self.ava.url_mini;
            self.title = "кто-то";
        }

        reinit_chat();

        self.send_my_message = function(m) {
            self.provider.Send(m);
        };

        self.disconnect = function() {
            clearInterval(self.start_timer);
            self.provider.Disconnect();
        };

        self.getLastUnexpiredChatSession = function() {
            return $q.when(true);
        };

        self.updateInfo = function() {
            return $q.when(true);
        };
    }
})();