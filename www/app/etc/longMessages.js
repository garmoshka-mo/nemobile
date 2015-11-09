angular.module('angServices').service('longMessages', [
    '$rootScope', '$q', 'userRequest',
    function($rootScope, $q, userRequest) {
        this.send = function(text, account, network) {
            var d = $q.defer();
            //todo: implement api call
            //var data = {
            //    text: text,
            //    account: account
            //};
            //return userRequest.sendForSure('POST', '/long_message_' + network, data);

            d.resolve();
            log('message sent');

            return d.promise;
        }
    }]);

angular.module("angControllers").controller("longMessagesController",
    ['$scope','longMessages',
        function ($scope, longMessages) {
            $scope.send = function(network) {
                if (!$scope.text || !$scope.account) {
                    $scope.sendNotice = 'Оба поля обязательны для заполнения';
                    return;
                }

                $scope.sending = true;
                longMessages.send($scope.text, $scope.account, network).then(function (data) {
                    $scope.sending = false;
                    $scope.sendNotice = 'Успешно отослано';
                    $scope.text = '';
                });
            }
        }
    ]);
    