var version = 'dev', config;
var IS_APP = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
var IS_MOBILE = isMobile();

var ua = navigator.userAgent.toLowerCase();
var IS_ANDROID = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");

window.onload = function onLoad() {
    config = new Config(App.Settings);
    window.debugMode = config('debugMode');
    bootstrapAngularApp();
    VK.init({apiId: 5067621, onlyWidgets: true});
};

angular.module("angApp")

.config(['$animateProvider', '$compileProvider', function($animateProvider, $compileProvider) {
    $animateProvider.classNameFilter(/^(?:(?!ng-animate-disabled).)*$/);
    //  Default imgSrcSanitizationWhitelist: /^\s*(https?|ftp|file):|data:image\//
    //  chrome-extension: will be added to the end of the expression
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|content):|data:image\//);
}])

.config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
}])

.config(['$translateProvider', function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: 'assets/locales/locale-',
        suffix: '.json'
    });
    //In order to change language provider from anywhere use:
    //$translate.use(langKey);
    $translateProvider.preferredLanguage('ru');
}])

.run(['messages', 'pubnubSubscription', 'separator', 'view', 'tracker', 'googleAnalytics', function() {
    //messages and pubnubsubscription are not used
    //but they have to be injected in order to be invoked
}]);


function bootstrapAngularApp() {
    if (IS_APP)
        document.addEventListener('deviceready', function() {
            angular.bootstrap(document, ['angApp']);
        });
    else
        angular.bootstrap(document, ['angApp']);
}
