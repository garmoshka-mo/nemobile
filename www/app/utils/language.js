(function(){
    angular.module("angServices")
        .service('language',
        ['$rootScope', '$translate', '$timeout', language]);
    
    function language($rootScope, $translate, $timeout) {

        var self = this; 

        self.available = [
            {name: 'Русский', key: 'ru'},
            {name: 'English', key: 'en'},
            {name: 'Español', key: 'es'},
            {name: '汉语', key: 'zh'}
        ];

        $timeout(
            function(){
                self.current = _.find(self.available, {key: $translate.use()});
            },
        0);
        
        self.change = function(langKey) {
            self.current = _.find(self.available, {key: langKey});
            $translate.use(langKey);
        };          

    }
})();