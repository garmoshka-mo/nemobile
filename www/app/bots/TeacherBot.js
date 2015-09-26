(function(){
    angular.module("angFactories").factory('TeacherBot',
        [
function() {

    return function TeacherBot(provider, filter) {

        var self = this;

        this.partnerLeft = false;

        var explanations = {
            what_is_auto_filter: {
                text: '🚦авто-фильтр - это функция из сайта dub.ink'
            },
            dont_be_rude: {
                text: '🐰Для того, чтобы система начала соединять вас с популярными пользователями - ' +
                'вам сначала должно начислиться определенное количетсво баллов за диалоги. ' +
                'Будучи грубым с текущими собеседниками, собирая жалобы от них - ' +
                'вы отдаляете свое общение с интересными людьми.'
            },
            partner_left: {
                text: 'собеседник уже покинул чат 😔' +
                'Не оставляйте без присмотра свое окошко, чтобы собеседники не скучали.'
            }
        };

        this.listen = function(message) {
            if (message.startsWith('Автоматическое пояснение:')) return;

            if (/автофил|автоматич|фильтр/i.exec(message))
                self.explain('what_is_auto_filter');
            else if (self.partnerLeft)
                self.explain('partner_left');
        };

        this.explain = function(key) {
            var e = explanations[key];
            if (!e.is_explained) {
                e.is_explained = true;
                var msg = 'Автоматическое пояснение: ' + e.text;
                provider.Send(msg);
                filter.log({text: msg, isOwn: true});
            }
        }

    }

}]);

})();

