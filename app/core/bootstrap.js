var version = 'dev', config;
var html5Mode = true;
var IS_APP = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
var IS_MOBILE = isMobile();
var ALT_UI;
var expVariation = 0;
var Rollbar;

var watches;
var userAgent = navigator.userAgent.toLowerCase();
var IS_ANDROID = userAgent.indexOf("android") > -1; //&& ua.indexOf("mobile");

$(function() {
    setIsAlt();
    config = new Config(App.Settings);
    window.debugMode = config('debugMode');
    if (config('rollbarKey')) initRollbar(config('rollbarKey'));

    watches = new Watches(bootstrapAngularApp);

    VK.init({apiId: 5067621, onlyWidgets: true});
});

angular.module("angApp")

    .config(['$animateProvider', '$compileProvider', function ($animateProvider, $compileProvider) {
        $animateProvider.classNameFilter(/^(?:(?!ng-animate-disabled).)*$/);
        //  Default imgSrcSanitizationWhitelist: /^\s*(https?|ftp|file):|data:image\//
        //  chrome-extension: will be added to the end of the expression
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|content):|data:image\//);
    }])

    .config(['$locationProvider', function ($locationProvider) {
        $locationProvider.html5Mode(html5Mode);
    }])

    .config(['$translateProvider', function ($translateProvider) {
        $translateProvider.useStaticFilesLoader({
            prefix: 'assets/locales/locale-',
            suffix: '.json?' + version
        });
        //In order to change language provider from anywhere use:
        //$translate.use(langKey);
        $translateProvider.preferredLanguage('ru');
        // remember language
        $translateProvider.useLocalStorage();
        $translateProvider.useSanitizeValueStrategy('escapeParameters');
    }])

    .config(['$provide', function ($provide) {
        $provide.decorator("$exceptionHandler", ['$delegate', function ($delegate) {

            // http://blog.gospodarets.com/track_javascript_angularjs_and_jquery_errors_with_google_analytics/

            $(document).ajaxError(function (event, request, settings) {
                var err = {
                    result: event.result,
                    status: request.status,
                    statusText: request.statusText,
                    crossDomain: settings.crossDomain,
                    dataType: settings.dataType
                };

                if (request.status != 401)
                    error('AJAX error', err);
            });

            // Pure JavaScript errors handler
            window.addEventListener('error', function (err) {
                if (Rollbar) Rollbar.error(err);
            });

            return function (exception, cause) {
                $delegate(exception, cause);
                if (Rollbar) Rollbar.error(exception);
            };
        }]);
    }])

    .run(['messages', 'pubnubSubscription', 'separator', 'view', 'tracker', 'googleAnalytics', function () {
        //messages and pubnubsubscription are not used
        //but they have to be injected in order to be invoked
    }]);

function setIsAlt() {
    ALT_UI = typeof $('body').attr('data-alt') != 'undefined';
    if (ALT_UI) {
       // if (localStorage.getItem('isLogged') && !localStorage.getItem('altUI'))
       //     ALT_UI = false;
    }
}

function bootstrapAngularApp() {
    if (IS_APP)
        document.addEventListener('deviceready', function () {
            angular.bootstrap(document, ['angApp']);
        });
    else
        angular.bootstrap(document, ['angApp']);
}
html5Mode=false;