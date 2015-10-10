(function(){
    angular.module("angServices")
        .service('language',
        ['$rootScope', '$translate', language]);
    
    function language($rootScope, $translate) {

        this.available = [
            {name: 'Русский', key: 'ru'},
            {name: 'English', key: 'en'},
            {name: 'Spanish', key: 'es'},
            {name: 'Chinese', key: 'zh'}
        ];

        this.current = this.available[0];

        this.change = function(langKey) {
            this.current = _.find(this.available, {key: langKey});
            $translate.use(langKey);
        };          

    }
})();