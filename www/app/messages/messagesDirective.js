(function(){
    angular.module("angApp").directive('messages', function() {
        return {
            scope: {session: '=', messageInput: '=', close: '&', preview: '@'},
            templateUrl: "app/messages/messages.html?"+version,
            controller: ['$scope', 'timer', '$sce', '$mdDialog', 'messageMenu', controller]
        };
    });

    function controller($scope, timer, $sce, $mdDialog, messageMenu) {
        log($scope.preview);
        $scope.formatMessage = function(message) {
            return parseUrls(message.text);
        };

        $scope.askShowSharing = function() {
            var showSharing;
            if(typeof $scope.session.incentives !== 'undefined')
                showSharing = $scope.session.incentives > 5;
            else
                showSharing = timer.lastDuration > 300;
            return showSharing;
        };

        function quoteIt(message) {
            return function() {
                $scope.messageInput = $scope.messageInput + ' > ' + message.text + ' < = ';
            };
        }

        function removeCurrentMessage(messageIndex) {
            return function() {
                $scope.session.messages.splice(messageIndex, 1);
            };
        }

        function removeMessagesAbove(messageIndex) {
            return function() {
                $scope.session.messages.splice(0, messageIndex);
            };
        }

        function removeMessagesBelow(messageIndex) {
            return function() {
                $scope.session.messages = $scope.session.messages.slice(0, messageIndex + 1);
            };
        }

        function hideMessage(message) {
            return function() {
                message.type = 'hidden';
                message.text = 'сообщение скрыто';
            };
        }


        // $scope.editMessage = function(message) {
        //     var parentEl = angular.element(document.body);
        //     $mdDialog.show({
        //         parent: parentEl,
        //          template:
        //            '<md-dialog aria-label="List dialog">' +
        //            '  <md-dialog-content>'+
        //            '    <input type="text" ng-model="message.text">' + 
        //            '  </md-dialog-content>' +
        //            '  <div class="md-actions">' +
        //            '    <md-button ng-click="closeDialog()" class="md-primary">' +
        //            '      Готово' +
        //            '    </md-button>' +
        //            '  </div>' +
        //            '</md-dialog>',
        //          locals: {
        //            message: message
        //          },
        //          controller: DialogController 
        //     });
        // };

        // function DialogController($scope, $mdDialog, message) {
        //     $scope.message = message;
        //     $scope.closeDialog = function() {
        //       $mdDialog.hide();
        //     };
        // }

        $scope.showMenu = function(message, index) {
            messageMenu.show([
                {name: 'цитировать', handler: quoteIt(message)},
                {name: 'скрыть сообщение', handler: hideMessage(message)},
                {name: 'удалить сообщение', handler: removeCurrentMessage(index)},
                {name: 'удалить сообщения выше', handler: removeMessagesAbove(index)},
                {name: 'удалить сообщения ниже', handler: removeMessagesBelow(index)}
            ]);
        };

        function parseUrls(messageText) {
            if (messageText.match(/(http|https):/)) {

                messageText = messageText.replace(/(https?:\/\/(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpg|gif|png))/g, '<img src="$&">');

                if (RAN_AS_APP) {
                    messageText = messageText.replace(/https?:\/\/(?![^" ]*(?:jpg|png|gif))[^" ]+/g, "<span class='message-link' onclick='navigator.app.loadUrl(\"$&\",{openExternal: true});'>$&</span>");
                }
                else {
                    messageText = messageText.replace(/https?:\/\/(?![^" ]*(?:jpg|png|gif))[^" ]+/g, "<a class='message-link' target='_blank' href='$&'>$&</a>");
                }
                return $sce.trustAsHtml(messageText);
            }  else {
                return messageText;
            }
        }
    }

})();