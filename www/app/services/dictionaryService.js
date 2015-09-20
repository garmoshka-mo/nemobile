angular.module("angServices")
.service('dictionary', [
    'storage',
    function(storage) {
        var translations = {
            "user_not_found": "Пользователь не найден",
            "wrong name or password": "Неправильное имя или логин",
            "name has already been taken": "Имя уже используется другим пользователем",
            "chat_expired": "Чат закрыт",
            "no_access_to_chat": "Чат закрыт",
            "password can't be blank": "Введите пароль",
            "chat_empty": "Собеседник покинул чат"
        };

        this.get = function(phrase) {
            return translations[phrase] || phrase;
        };    
}]);