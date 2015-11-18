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