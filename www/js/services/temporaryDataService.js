services
.service('temporaryData', [
    'storage',
    function(storage) {
        var translations = {
            "user_not_found": "пользователь не найден",
            "wrong name or password": "неправильное имя или логин",
            "name has already been taken": "имя уже используется другим пользователем",
            "chat_expired": "чат закрыт",
            "password can't be blank": "введите пароль"
        };

        this.get = function(phrase) {
            return translations[phrase] || phrase;
        };    
}]);