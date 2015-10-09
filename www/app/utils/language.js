(function(){
    angular.module("angServices")
        .service('language',
        ['$rootScope', language]);
    function language($rootScope) {

        this.available = {
            'ru': {name: 'Русский', key: 'ru'},
            'en': {name: 'English', key: 'en'},
            'es': {name: 'Spanish', key: 'es'},
            'zh': {name: 'Chinese', key: 'zh'}
        };

        this.current = this.available[0];

        this.change = function(langKey) {
            this.current = this.available[langKey];
            $translate.use(langKey);
        };          

    }

})();