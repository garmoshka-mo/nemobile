angular.module('angServices').service('longMessages', [
    '$rootScope', '$q', 'userRequest', 'socket', 'chats',
    function($rootScope, $q, userRequest, socket, chats) {
        this.addUser = function(account, network) {
            var data = {
                access_token: user.accessToken,
                account: account,
                network: network
            };
            return userRequest.sendForSure('POST', '/add_virtual_user', data);
        };

        //Called right after virtual chat channel was successfully set
        var virtualChatInitHandler = function() {};

        this.setVirtualChatInitHandler = function(handler) {
            virtualChatInitHandler = function () {
                if (handler) handler();
            };
        };

        /**
         * Once virtual chat was created, it won't have channel property
         * channel property comes with each sent/received socket 'message'
         */
        socket.on('message', function(envelope) {
            var chat = chats.getCurrent();
            if (chat.isVirtual && !chat.channel) {
                //get channel from message
                chat.channel = envelope.channel;
                virtualChatInitHandler();
            }
        });
    }]);

angular.module("angControllers").controller("longMessagesController",
    ['$scope','longMessages', 'chats', 'gallery','$timeout',
        function ($scope, longMessages, chats, gallery, $timeout) {

            var chat = null;

            $scope.send = function(network) {
                if (!$scope.text || !$scope.account) {
                    $scope.sendNotice = 'Оба поля обязательны для заполнения';
                    return;
                }

                $scope.sending = true;
                longMessages.addUser($scope.account, network).then(function (data) {
                    chats.newRandomInternal(null, user.uuid, null, data.uuid, true);
                    chat = chats.getCurrent();
                    chat.ensureSession().then(function (session) {
                        $timeout(function(){
                            //todo: make other service responsible for sending messages
                            gallery.sendMessage($scope.text);
                            //called right after channel initialization
                            longMessages.setVirtualChatInitHandler(afterSend);
                        }, 1000);
                    });
                });
            };

            function afterSend(){
                $scope.sending = false;
                $scope.sendNotice = 'Вот ссылка. Теперь можете отправить её публично владельцу аккаунта. Перейдя по ссылке, только он сможет увидеть, что вы написали.';
                $scope.link = config('appUrl') + '/m/' + chat.channel;
                $scope.text = '';
                $scope.$apply();
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
