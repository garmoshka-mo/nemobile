services
    .service('externalChat', [ExternalChat]);
function ExternalChat() {

// ToDo:  прикутить отправку уведомления о печатаньи на внешний чат!
//chat.Typing() - Отправляет собеседнику сообщение о том, что вы печатаете

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

    var self = this;
    this.chat = null;
    this.talking = false;

    this.start = function(preferences) {
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
            if (!self.talking)
                chat.Connect();
            else
                alert('empty_chat');
        }

        function got_message(message) {
            console.log('Сообщение от незнакомца: "' + message + '"');
        }
    }

    function composeIntro(p) {
        /*
        * Ж 18-22?
        * без общения на св.темы, только интимн.темы, только с видео
        * Я - M (22-25)
        *
        * Ж 36+?
        * общение на своб.темы+, интимн.темы+, видео+
        * Я - M
        * */
        var req = [];
        if (p.subjects.free_talk == -1) req.push('без общения на св.темы');
        if (p.subjects.free_talk == 1) req.push('общение на разные темы+');
        if (p.subjects.free_talk == 2) req.push('только общение');

/*
        if (p.subjects.real == -1) req.push('без общения на св.темы');
        if (p.subjects.real == 1) req.push('общение на разные темы+');
        if (p.subjects.real == 2) req.push('только общение');
*/

        if (p.subjects.sexual == -1) req.push('без интимн. тем');
        if (p.subjects.sexual == 1) req.push('интим. темы+');
        if (p.subjects.sexual == 2) req.push('только интимн.темы');

        if (p.subjects.video == -1) req.push('без видео');
        if (p.subjects.video == 1) req.push('с видео+');
        if (p.subjects.video == 2) req.push('только с видео');

        var you = [];
        if (p.look_for.gender == 'm') you.push('M');
        if (p.look_for.gender == 'w') you.push('Ж');
        if (!(p.look_for.age_range[0] == 0 && p.look_for.age_range[1] == 100)) {
            if (p.look_for.age_range[0] == 0)
                you.push('до '+p.look_for.age_range[1]);
            else if (p.look_for.age_range[1] == 100)
                you.push(p.look_for.age_range[0]+'+');
            else
                you.push(p.look_for.age_range[0]+'-'+p.look_for.age_range[1]);
        }

        var me;
        if (p.me.gender == 'm') me = 'я - М';
        if (p.me.gender == 'w') me = 'я - Ж';

        var result = '';
        if (you.length > 0) result += you.join(' ')+'?\n';
        if (req.length > 0) result += req.join(', ')+'\n';
        if (me) result += me;

        return result;
    }

    this.end = function() {
        chat.Disconnect();
    };

}