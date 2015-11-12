angular.module('angServices').service('longMessages', [
    '$rootScope', '$q', 'userRequest', 'socket', 'chats',
    function($rootScope, $q, userRequest, socket, chats) {
        var self = this;

        this.fakeSession = {
            messages: [

            ]
        };

        this.sendSecret = function(account, provider, text) {
            var data = {
                provider_account: {
                    account: account,
                    provider: provider
                },
                messages: [{ text: text, isOwn: false }]
            };
            return userRequest.sendForSure('POST', '/secret', data);
        };

        this.getSecret = function(shortCode) {
            return userRequest.send('GET', '/secret/' + shortCode);
        };

        this.replyToSecret = function(shortCode) {
            return userRequest.send('PATCH', '/secret/' + shortCode, {messages: self.fakeSession.messages});
        }

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
                longMessages.sendSecret($scope.account, provider, $scope.text).then(function (data) {
                    $scope.sending = false;
                    $scope.sendNotice = 'Вот ссылка. Теперь можете отправить её публично владельцу аккаунта. Перейдя по ссылке, только он сможет увидеть, что вы написали.';
                    $scope.link = config('appUrl') + '/m/' + data.short_code;
                    $scope.text = '';
                });
            };
        }
    ]);

angular.module("angControllers").controller("readMessageController",
    ['$scope','longMessages', '$stateParams', 'hello', '$q',
        function ($scope, longMessages, $stateParams, hello, $q) {
            $scope.provider = null;

            $scope.l = longMessages;
            function showMessage() {

                longMessages.validUser = true;
            }

            longMessages.getSecret($stateParams.shortCode).then(function(data) {
                $scope.provider = data.provider_account;
                longMessages.shortCode = $stateParams.shortCode;
                longMessages.fakeSession.messages = data.messages;
            });

            function getUsername(data, provider) {
                var d = $q.defer();
                switch (provider) {
                    case 'twitter':
                        log(data.authResponse.screen_name);
                        d.resolve(data.authResponse.screen_name);
                        break;
                    case 'instagram':
                        hello.me(provider).then(function (res) {
                            d.resolve(res.data.username);
                        });
                        break;
                    default:
                        d.reject();
                }
                return d.promise;
            }

            $scope.confirm = function(provider) {
                hello.login(provider.provider).then(function (data) {
                        log('LOGGED IN!');
                        getUsername(data, provider.provider).then(function (username) {
                            //todo: insecure
                            if (provider.account.toLowerCase() == username.toLowerCase()) {
                                showMessage();
                            } else {
                                $scope.notice = 'Простите, но данное сообщение предназначалось не вам, ' + username + ', а ' + provider.account;
                            }
                        });
                    },
                    function (e) {
                        log('NOT LOGGED IN!');
                        log(e)
                    })
            }
        }
    ]);

angular.module("angControllers").controller("answerMessagePanelController",
    ['$scope','longMessages', 'separator', 'dictionary',
        function ($scope, longMessages, separator, dictionary) {
            var $chatInput = $('.chat-input');
            separator.setMainFooter($('#footer'));
            $scope.l = longMessages;

            $scope.sendMessage = function() {

                var textToSend = $chatInput.html();
                if (textToSend) {
                    $chatInput.text('');

                    $scope.isMessageSending = true;

                    longMessages.fakeSession.messages.push({ isOwn: true, text: textToSend });
                    longMessages.replyToSecret(longMessages.shortCode)
                        .then(
                        function() {
                            //done
                        },
                        function(res) {
                            $scope.handleFailedSending(res);
                        }
                    )
                        //doubling function because .finally doesn't work on android 2.2
                        .then(afterSent, afterSent);

                    function afterSent() {
                        $scope.isMessageSending = false;
                    }

                }
            };

            $scope.input_keypress = function(event) {
                //if ctrl+enter or enter is pressed
                if ((event.keyCode == 10 || event.keyCode == 13) && event.ctrlKey || event.keyCode == 13) {
                    event.preventDefault();
                    $scope.sendMessage();
                }
            };

            $scope.handleFailedSending = function(errorDescription) {
                $scope.errorDescription = dictionary.get(errorDescription);
            };
        }
    ]);
