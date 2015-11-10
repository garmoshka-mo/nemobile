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
    ['$scope','longMessages', 'chats', 'gallery',
        function ($scope, longMessages, chats, gallery) {
            $scope.send = function(network) {
                if (!$scope.text || !$scope.account) {
                    $scope.sendNotice = 'Оба поля обязательны для заполнения';
                    return;
                }

                $scope.sending = true;
                longMessages.addUser($scope.account, network).then(function (data) {
                    chats.newRandomInternal(null, user.uuid, null, data.uuid, true);
                    chats.getCurrent().ensureSession().then(function (session) {
                        setTimeout(function(){
                            //todo: make other service responsible for sending messages
                            gallery.sendMessage($scope.text);

                            $scope.sending = false;
                            $scope.sendNotice = 'Вот ссылка. Теперь можете отправить её публично владельцу аккаунта. Перейдя по ссылке, только он сможет увидеть, что вы написали.';
                            //todo: show real link
                            $scope.link = 'http://dub.ink/m/foobar123';
                            $scope.text = '';
                        }, 1000);
                        //session.sendMessage($scope.text, {uuid: data.uuid}, 3600).then(function () {
                        //    log('MESSAGE SENT');
                        //    //chats.getCurrent().disconnect();
                        //});
                    });
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
