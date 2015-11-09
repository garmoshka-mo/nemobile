angular.module('angServices').service('longMessages', [
    '$rootScope', '$q',
    function($rootScope, $q) {
        this.send = function(text, account) {
            var d = $q.defer();
            //todo: api call
            d.resolve();
            log('message sent');

            return d.promise;
        }
    }]);

angular.module("angControllers").controller("longMessagesController",
    ['$scope','longMessages',
        function ($scope, longMessages) {
            $scope.send = function() {
                if (!$scope.text || !$scope.account) {
                    $scope.sendNotice = 'Оба поля обязательны для заполнения';
                    return;
                }

                $scope.sending = true;
                longMessages.send($scope.text, $scope.account).then(function (data) {
                    $scope.sending = false;
                    $scope.sendNotice = 'Успешно отослано';
                    $scope.text = '';
                });
            }
        }
    ]);
    