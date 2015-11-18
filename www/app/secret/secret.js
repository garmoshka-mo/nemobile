angular.module('angServices').service('secret', [
    '$rootScope', '$q', 'userRequest', 'socket', 'chats',
    function($rootScope, $q, userRequest, socket, chats) {
        var self = this;

        this.fakeSession = {
            messages: [

            ]
        };

        this.sendSecret = function(account, provider, text, expiresSec) {
            var data = {
                provider_account: {
                    account: account,
                    provider: provider
                },
                messages: [{ text: text, isOwn: false }],
                expires_sec: expiresSec
            };

            return userRequest.sendForSure('POST', '/secret', data);
        };

        this.getSecret = function(shortCode) {
            return userRequest.send('GET', '/secret/' + shortCode);
        };

        this.replyToSecret = function(shortCode) {
            return userRequest.sendForSure('PATCH', '/secret/' + shortCode, {messages: self.fakeSession.messages});
        };

        this.formatAccount = function(account) {
            return (account.charAt(0) != '@'? '@'+ account: account).toLowerCase().trim();
        }

    }]);

angular.module("angControllers").controller("sendSecretController",
    ['$scope','secret',
        function ($scope, secret) {

            $scope.provider = 'twitter';
            $scope.showForWhat = true;

            $scope.durations = [
                {name:'duration.5minutes', seconds: 300},
                {name:'duration.1hour', seconds: 3600},
                {name:'duration.1day', seconds: 86400},
                {name:'duration.7days', seconds: 604800},
                {name:'duration.10years', seconds: 315400000}
            ];
            $scope.expiresSec = 315400000;
            $scope.setExpires = function(expiresSec) {
                $scope.expiresSec = expiresSec;
            };

            $scope.send = function() {
                if (!$scope.text || !$scope.account) {
                    $scope.sendNotice = 'Оба поля обязательны для заполнения';
                    return;
                }

                $scope.sending = true;

                $scope.formattedAccount = secret.formatAccount($scope.account);

                secret.sendSecret($scope.formattedAccount, $scope.provider, $scope.text, $scope.expiresSec).then(function (data) {
                    $scope.sending = false;
                    $scope.sendNotice = 'Вот ссылка. Теперь можете отправить её публично владельцу аккаунта. Перейдя по ссылке, только он сможет увидеть, что вы написали.';
                    $scope.link = config('appUrl') + '/secret/' + data.short_code;
                    $scope.publicMsg = $scope.formattedAccount + ', сообщение для тебя ' + $scope.link;
                    $scope.tweetMsg = $scope.formattedAccount + ', сообщение для тебя ';
                    $scope.text = '';
                });
            };
        }
    ]);

angular.module("angControllers").controller("readSecretController",
    ['$scope','secret', '$stateParams', 'hello', '$q',
        function ($scope, secret, $stateParams, hello, $q) {
            $scope.provider = null;
            $scope.shortCode = $stateParams.shortCode;

            $scope.s = secret;
            function showMessage() {

                secret.validUser = true;
            }

            secret.getSecret($stateParams.shortCode).then(function(data) {
                if(data.is_expired) {
                    $scope.notice = 'К сожалению, время сообщения истекло.'
                } else {
                    $scope.provider = data.provider_account;
                    secret.shortCode = $stateParams.shortCode;
                    secret.fakeSession.messages = data.messages;
                }

            },function(){
                $scope.notice = 'Не удалось распознать тип аккаунта для входа. Возможно неверная ссылка';
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
                            var formattedUsername = secret.formatAccount(username);
                            if (provider.account == formattedUsername) {
                                showMessage();
                            } else {
                                $scope.notice = 'Простите, но данное сообщение предназначалось не вам, ' + formattedUsername + ', а ' + provider.account;
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

angular.module("angControllers").controller("answerSecretPanelController",
    ['$scope','secret', 'separator', 'dictionary',
        function ($scope, secret, separator, dictionary) {
            var $chatInput = $('.chat-input');
            separator.setMainFooter($('#footer'));
            $scope.s = secret;

            $scope.sendMessage = function() {

                var textToSend = $chatInput.html();
                if (textToSend) {
                    $chatInput.text('');

                    $scope.isMessageSending = true;

                    secret.fakeSession.messages.push({ isOwn: true, text: textToSend });
                    secret.replyToSecret(secret.shortCode)
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
