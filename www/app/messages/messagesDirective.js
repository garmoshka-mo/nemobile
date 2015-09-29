(function(){
    angular.module("angApp").directive('messages', function() {
        return {
            scope: {session: '=', close: '&', chat: '='},
            templateUrl: "app/messages/messages.html?"+version,
            controller: ['$scope', 'timer', '$sce', '$mdDialog', '$timeout', '$rootScope', controller]
        };
    });

    function controller($scope, timer, $sce, $mdDialog, $timeout, $rootScope) {
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
            $rootScope.$broadcast('quote message', {message: message});
        }

        function removeCurrentMessage(message, messageIndex) {
            $scope.session.messages.splice(messageIndex, 1);
        }

        function removeMessagesAbove(message, messageIndex) {
            $scope.session.messages.splice(0, messageIndex);
        }

        function removeMessagesBelow(message, messageIndex) {
            $scope.session.messages = $scope.session.messages.slice(0, messageIndex + 1);
        }

        function hideMessage(message) {
            message.type = 'hidden';
            message.text = '';
        }

        function editMessage(message) {
            var parentEl = angular.element(document.body);
            $mdDialog.show({
                parent: parentEl,
                templateUrl: 'app/messages/editMessageDialog.html',
                locals: {
                   message: message
                 },
                controller: DialogController 
            });
        }

        function DialogController($scope, $mdDialog, message) {
            $scope.message = message;
            $scope.closeDialog = function() {
              $mdDialog.hide();
            };
        }

        var previewMessageMenu = [
            {name: 'Редактировать', handler: editMessage},
            {name: 'Скрыть текс/картинку', handler: hideMessage},
            {name: 'Удалить сообщение', handler: removeCurrentMessage},
            {name: 'Удалить сообщения <span class="text-bold">выше</span>',
             handler: removeMessagesAbove},
            {name: 'Удалить сообщения <span class="text-bold">ниже</span>', 
            handler: removeMessagesBelow}
        ];

        var chatMessageMenu = [
            {name: 'цитировать', handler: quoteIt},
        ];

        if ($scope.chat === true) {
            $scope.messageMenuItems = chatMessageMenu;
        }
        else {
            $scope.messageMenuItems = previewMessageMenu;
            
        }

        $scope.showMenu = function(event, message, messageIndex) {
            // calculateMenuPosition(ev);
            $timeout(function(){$scope.messageMenuApi.open(event, message, messageIndex);},0);
            
        };

        function parseUrls(messageText) {
            if (messageText.match(/(http|https):/)) {

                messageText = messageText.replace(/(https?:\/\/(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpg|gif|png))/g, '<div><img class="message-image" src="$&"></div>');

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