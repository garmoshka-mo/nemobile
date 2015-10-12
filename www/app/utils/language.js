(function(){
    angular.module("angServices")
        .service('language',
        ['$rootScope', '$translate', '$timeout', language]);
    
    function language($rootScope, $translate, $timeout) {

        var self = this; 

        self.available = [
            {name: 'English', key: 'en'},
            {name: 'Русский', key: 'ru'},
            {name: 'Español', key: 'es'},
            {name: '汉语', key: 'zh'}
        ];
        
        self.current = _.find(self.available, {key: $translate.proposedLanguage()});
       
        self.change = function(langKey) {
            self.current = _.find(self.available, {key: langKey});
            $translate.use(langKey);
        };          

    }
})();