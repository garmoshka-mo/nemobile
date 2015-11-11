angular.module('angServices').service('longMessages', [
    '$rootScope', '$q', 'userRequest', 'socket', 'chats',
    function($rootScope, $q, userRequest, socket, chats) {
        this.ensureRecipient = function(account, provider) {
            var data = {
                provider_account: {
                    account: account,
                    provider: provider
                }
            };
            return userRequest.sendForSure('POST', '/ensure_recipient', data);
        };

        this.getAddresseeDetails = function(channel) {
            return userRequest.send('GET', '/chats/' + channel + '/addressee_details');
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

            $scope.send = function(provider) {
                if (!$scope.text || !$scope.account) {
                    $scope.sendNotice = 'Оба поля обязательны для заполнения';
                    return;
                }

                $scope.sending = true;
                longMessages.ensureRecipient($scope.account, provider).then(function (data) {
                    //TODO: remove hardcoded after API fix
                    chats.newRandomInternal(null, user.uuid, null, 'c2c9a178-8880-11e5-ac67-86b5df6ad7ec', true);
                    //chats.newRandomInternal(null, user.uuid, null, data.uuid, true);
                    chat = chats.getCurrent();
                    chat.ensureSession().then(function (session) {
                        $timeout(function(){
                            //todo: make other service responsible for sending messages
                            gallery.sendMessage($scope.text);
                            //called right after channel initializationF
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
    ['$scope','longMessages', '$stateParams', 'hello',
        function ($scope, longMessages, $stateParams, hello) {
            var accessToken = null;
            $scope.providers = [];

            $scope.account = 'username';
            $scope.network = 'twitter';

            function showMessage() {
                alert('YOUR MESSAGE');
                //todo: show message to recipient
            }

            longMessages.getAddresseeDetails($stateParams.channel).then(function(data) {
                $scope.providers = data.providers;
                //todo: insecure
                if(user.accessToken && user.accessToken == accessToken) {
                    showMessage()
                }
            });

            $scope.confirm = function(provider) {
                hello.login(provider.provider).then(function (data) {
                        log('LOGGED IN!');
                        var screenName = data.authResponse.screen_name;
                        //todo: insecure
                        if (provider.account.toLowerCase() == screenName.toLowerCase()) {
                            showMessage();
                        } else {
                            $scope.notice = 'Простите, но данное сообщение предназначалось не вам, ' + screenName + ', а ' + provider.account;
                            $scope.$apply();
                        }
                    },
                    function (e) {
                        log('NOT LOGGED IN!')
                        log(e)
                    })
            }
        }
    ]);
