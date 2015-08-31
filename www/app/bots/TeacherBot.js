(function(){
    factories.factory('TeacherBot',
        [
function() {

    return function TeacherBot(provider, filter) {

        var self = this;

        var explanations = {
            what_is_auto_filter: {
                text: 'автофильтр - это функция из сайта dub.ink'
            },
            dont_be_rude: {
                text: '"Для того, чтобы система начала соединять вас с популярными пользователями - ' +
                'вам сначала должно начислиться определенное количетсво баллов за диалоги. ' +
                'Будучи грубым с текущими собеседниками, собирая жалобы от них - ' +
                'вы отдаляете свое общение с интересными людьми."'
            }
        };

        this.listen = function(message) {
            if (/автофил|фильтр/i.exec(message))
                self.explain('what_is_auto_filter');
        };

        this.explain = function(key) {
            var e = explanations[key];
            if (!e.is_explained) {
                e.is_explained = true;
                var msg = 'Авто-пояснение: ' + e.text;
                provider.Send(msg);
                filter.log({text: msg, isOwn: true});
            }
        }

    }

}]);

})();

