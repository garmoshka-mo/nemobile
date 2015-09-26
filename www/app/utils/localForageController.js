angular.module("angControllers")
    .controller("localForageController",
    ['$scope', '$resource',
function($scope, $resource){

    $scope.config =  localStorage['config'];
    $scope.apiUrl = config('apiUrl');
    $scope.debug = config('debugMode');
    $scope.externalChat =  config('externalChat');

    $scope.$watch('apiUrl', function() {
        localStorage['apiUrl'] = $scope.apiUrl;
    });
    $scope.$watch('externalChat', function() {
        localStorage['externalChat'] = $scope.externalChat;
    });
    $scope.$watch('debug', function() {
        localStorage['debugMode'] = $scope.debug;
    });



    $scope.save_config = function() {
        localStorage['config'] = $scope.config;
        parse_config($scope.config);
    };

    function parse_config(text) {
        if (text) {
            var matchedText = text.match(/^(\w*)=(.*)$/mg);
            if (matchedText) {
                matchedText.forEach(function(v) {
                    var match = /^(\w*)=(.*)/g.exec(v),
                        key = match[1],
                        value = match[2];
                    localStorage[key] = value;
                    $scope[key] = config(key);
                });
            }
        }
    }


}]);