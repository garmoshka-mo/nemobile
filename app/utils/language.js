(function(){
    angular.module("angServices")
        .service('language',
        ['$rootScope', '$translate', '$timeout', '$http', '$q', language]);
    
    function language($rootScope, $translate, $timeout, $http, $q) {

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

        var countriesLanguages = {
            "russian": ['AZ', 'AM', 'BY', 'GE', 'KZ', 'RU', 'TJ', 'TM', 'UZ', 'UA', 'KG', 'MD'],
            "spanish": ['ES', 'BO', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV', 'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'PR', 'UY', 'VE', 'PH', 'GQ'],
            "chinese": ['CN', 'SG']
        };

        self.detectLanguage = function() {
            var d = $q.defer();

            //If there is a hard setting for language
            if (document.documentElement.lang) {
                d.resolve(document.documentElement.lang);
                return d.promise;
            }

            var userLanguage = window.navigator.userLanguage || window.navigator.language;
            userLanguage = parseUserLanguage(userLanguage);
            
            if (userLanguage == 'en') {
                $http.get("http://ipinfo.io/json")
                .then(
                    function(response) {
                        if (_.includes(countriesLanguages.russian, response.data.country)) {
                            d.resolve('ru');
                        }
                        else if (_.includes(countriesLanguages.spanish, response.data.country)) {
                            d.resolve('es');
                        }
                        else if (_.includes(countriesLanguages.chinese, response.data.country)) {
                            d.resolve('zh');
                        }
                        else {
                            d.resolve('en');
                        }
                        log(response.data.city, response.data.country, response.data);
                    }
                );
                return d.promise;
            }

            var languageSearchResult = _.find(self.available, {key: userLanguage});
            if (languageSearchResult) {
                d.resolve(languageSearchResult.key);
            }
            else {
                d.resolve('en');
            }
            return d.promise;
        };

        function parseUserLanguage(userLanguage) {
            
            if (userLanguage.match(/en/)) {
                return 'en';
            }

            if (userLanguage.match(/es/)) {
                return 'es';
            }

            if (userLanguage.match(/zh/)) {
                return 'zh';
            }

            if (userLanguage.match(/ru/)) {
                return 'ru';
            }

            return userLanguage;

        }

    }
})();