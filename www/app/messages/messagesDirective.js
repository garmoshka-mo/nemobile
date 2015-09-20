(function(){
    angular.module("angApp").directive('messages', function() {
        return {
            scope: {session: '=', messageInput: '=', close: '&', preview: '@'},
            templateUrl: "app/messages/messages.html",
            controller: ['$scope', 'timer', '$sce', '$mdDialog', controller]
        };
    });

    function controller($scope, timer, $sce, $mdDialog) {
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

        $scope.quoteIt = function(message) {
            $scope.messageInput = $scope.messageInput + ' > ' + message.text + ' < = ';
        };

        $scope.removeCurrentMessage = function(messageIndex) {
            $scope.session.messages.splice(messageIndex, 1);
        };

        $scope.removeMessagesAbove = function(messageIndex) {
            $scope.session.messages.splice(0, messageIndex);
        };

        $scope.removeMessagesBelow = function(messageIndex) {
            $scope.session.messages = $scope.session.messages.slice(0, messageIndex + 1);
        };

        $scope.editMessage = function(message) {
            var parentEl = angular.element(document.body);
            $mdDialog.show({
                parent: parentEl,
                 template:
                   '<md-dialog aria-label="List dialog">' +
                   '  <md-dialog-content>'+
                   '    <input type="text" ng-model="message.text">' + 
                   '  </md-dialog-content>' +
                   '  <div class="md-actions">' +
                   '    <md-button ng-click="closeDialog()" class="md-primary">' +
                   '      Готово' +
                   '    </md-button>' +
                   '  </div>' +
                   '</md-dialog>',
                 locals: {
                   message: message
                 },
                 controller: DialogController 
            });
        };

        function DialogController($scope, $mdDialog, message) {
            $scope.message = message;
            $scope.closeDialog = function() {
              $mdDialog.hide();
            };
        }

        $scope.hideMessage = function(message) {
            message.type = 'hidden';
            message.text = 'сообщение скрыто';
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