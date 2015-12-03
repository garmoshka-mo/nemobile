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
                    $scope.expired = true;
                } else {
                    $scope.provider = data.provider_account;
                    secret.dummySession.messages = data.messages;
                    secret.shortCode = $stateParams.shortCode;
                    
                    if ($scope.provider.account == '')
                        showMessage();
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