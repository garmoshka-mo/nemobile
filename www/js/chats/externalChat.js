services
    .service('externalChat',
    ['avatars', '$q', ExternalChat]);
function ExternalChat(avatars, $q) {

// ToDo:  прикутить отправку уведомления о печатаньи на внешний чат!
//chat.Typing() - Отправляет собеседнику сообщение о том, что вы печатаете

    var self = this;
    this.chat = null;
    this.talking = false;
    this.isVirtual = true;

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
        'onReceiveMyMessage': function(message){
            console.log('Мое сообщение: "'+message+'"');
        }
    };

    self.start = function(preferences) {
        var intro = composeIntro(preferences);

        if (intro.length < 1) intro = '..';

        conversation_machine(intro);
    };

    function conversation_machine(intro) {
        var chat = new Chat(_.extend({
            onBegin: userFound,
            onEnd: terminated,
            onDisconnect: terminated,
            onReceiveStrangerMessage: got_message
        }, defaultOptions));

        chat.Connect();

        function userFound() {
            chat.Send(intro);
        }

        function terminated() {
            console.log('Terminated while talking="' + self.talking + '"');
            if (!self.talking)
                chat.Connect();
            else
                alert('empty_chat');
        }

        function got_message(message) {
            if (!self.talking) start_chat();
            console.log('Сообщение от незнакомца: "' + message + '"');
        }

        function start_chat() {
            init_chat();
            routing.goto('chat', {chatType: 'external_chat', fromState: 'random'});
            console.warn('Тут надо отключить старый запрос в нашу очередь.');
        }
    }

    function init_chat() {
        var partner_id = Math.random();
        self.lastUnexpiredChatSession = new ChatSession(partner_id);
        self.chatSessionsIndexes = [self.lastUnexpiredChatSession.id];
        self.ava = avatars.from_id(partner_id);
        self.photoUrl = self.ava.url;
        self.photoUrlMini = self.ava.url_mini;
    }

    self.end = function() {
        chat.Disconnect();
    };

    self.getLastUnexpiredChatSession = function() {
        $q.resolve();
    };

    function ChatSession(senderId) {
        this.isExpired = false;
        this.isReplied = false;
        this.id = Math.random();
        this.channelName = null;
        this.senderId = senderId;
        this.messages = [];
        this.timer = null;
        this.creatorId = null;
        this.currentChat = null;
        this.whenExipires = Infinity;
    }
    ChatSession.prototype = {

        close: function() {
            this.isExpired = true;

            if (this.isReplied) {
                this.currentChat.handleExpiredChatSession();
            }
            else {
                this.currentChat.removeLastChatSession();
            }
            console.warn("chat session expired");
        },

        setTimeout: function(time) {
            var self = this;
            // console.log("timer for chatSession is set. Left(msec): " + time);

            // if time is more than 2147483647 (approximately 24 days) timer callback function is called instantly
            // https://stackoverflow.com/questions/3468607/why-does-settimeout-break-for-large-millisecond-delay-values/3468650#3468650

            if (time > 2147483647) {
                this.extraTime = time - 2147483647;
                time = 2147483647;
                // console.log("extra time is added(msec): " + this.extraTime);
            }

            if (this.timer) {
                $timeout.cancel(this.timer);
            }

            this.timer = $timeout(function() {
                if (self.extraTime > 0) {
                    return false;
                }
                self.close();
            }, time);
        },

        setTimer: function(expires) {
            var chatSession = this;
            var ttl;
            if (deviceServerTimeDifference_msec) {
                ttl = calculateMessageTtl(expires);
                chatSession.setTimeout(ttl);
                chatSession.whenExipires = new Date().getTime() + ttl;
            }
            else {
                api.getTimeDifference()
                    .then(function(timeDifference) {
                        deviceServerTimeDifference_msec = timeDifference;
                        ttl = calculateMessageTtl(expires);
                        chatSession.setTimeout(ttl);
                        chatSession.whenExipires = new Date().getTime() + ttl;
                        chatSession.save();
                    });
            }
        },

        setReplied: function() {this.isReplied = true;},

        save: function() {
            storage.saveChatSession(this, this.currentChat[this.currentChat.primaryKey]);
            console.log("chat session is saved");
        },

        getLastMessage: function() {
            if (this.messages.length) {
                var messagesAmount = this.messages.length;
                var text = this.messages[messagesAmount - 1].text;
                if (text.match(/(http|https):/)) {
                    var imagesExtensitions = ['gif', 'png', 'jpeg', 'jpg'];
                    var splitted = text.split(".");
                    var extensition = splitted[splitted.length - 1];

                    if (imagesExtensitions.indexOf(extensition) != -1) {
                        return "(изображение)";
                    }
                    else {
                        return "(ссылка)";
                    }
                }
                else {
                    return htmlToPlaintext(text);
                }
            }
        },

        sendMessage: function(message) {
            var self = this;
            chat.Send(message);

            var deferred = $q.defer();

            deferred.resolve();

            return deferred.promise;

         /*   return api
            .then(
                function(res) {
                    self.messages.push({
                        text: message.sanitize(),
                        isOwn: true
                    });

                    else {
                        return $q.reject(res.data.error);
                    }

                },
                function(res) {
                    console.error(res);
                }
            );*/
        }
    };
}