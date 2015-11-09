angular.module('angServices').service('longMessages', [
    '$rootScope', '$q', 'userRequest',
    function($rootScope, $q, userRequest) {
        this.addUser = function(account, network) {
            var data = {
                access_token: user.accessToken,
                account: account,
                network: network
            };
            return userRequest.sendForSure('POST', '/add_virtual_user', data);
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
                longMessages.addUser($scope.account, network).then(function (data) {
                    log(data);
                    //todo: open virtual chat
                    //todo: send text to virtual chat

                    $scope.sending = false;
                    $scope.sendNotice = 'Успешно отослано. Вот ссылка';
                    //todo: show link
                    $scope.link = 'http://dub.ink/m/foobar123';
                    $scope.text = '';
                });
            }
        }
    ]);
angular.module("angControllers").controller("readMessageController",
    ['$scope','longMessages', '$stateParams',
        function ($scope, longMessages, $stateParams) {
            //
            $scope.messageId = $stateParams.message;
            //todo: detect type of auth by message id
            $scope.network = 'twitter';
            //todo: and account name
            $scope.account = 'user_name';
        }
    ]);
