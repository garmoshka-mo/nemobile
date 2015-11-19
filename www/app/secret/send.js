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
            $scope.expiresSec = 86400;
            $scope.setExpires = function(expiresSec) {
                $scope.expiresSec = expiresSec;
            };

            $scope.send = function() {
                if (!$scope.text) {
                    $scope.sendNotice = 'Нужно ввести текст сообщения';
                    return;
                }

                $scope.sending = true;

                $scope.formattedAccount = secret.formatAccount($scope.account);

                secret.sendSecret($scope.formattedAccount, $scope.provider, $scope.text, $scope.expiresSec)
                .then(function (data) {
                    $scope.sending = false;
                    $scope.link = config('appUrl') + '/secret/' + data.short_code;
                    if ($scope.account) {
                        $scope.publicMsg = $scope.formattedAccount + ', сообщение для тебя ' + $scope.link;
                        $scope.tweetMsg = $scope.formattedAccount + ', сообщение для тебя ';
                    } else {
                        $scope.publicMsg = $scope.link;
                    }
                    $scope.text = '';
                });
            };
        }
    ]);