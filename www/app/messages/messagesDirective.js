(function(){
    angular.module("angApp").directive('messages', function() {
        return {
            scope: {session: '=', lookAgain: '&', chatSettings: '&', chat: '='},
            templateUrl: "app/messages/messages.html?"+version,
            controller: ['$scope', 'chatHeader', '$sce', '$mdDialog', '$timeout', '$rootScope', controller]
        };
    });

    function controller($scope, chatHeader, $sce, $mdDialog, $timeout, $rootScope) {
        $scope.formatMessage = function(message) {
            return parseUrls(message.text);
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
                templateUrl: 'app/messages/editMessageDialog.html?'+version,
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
            {name: 'publish.message.edit', handler: editMessage},
            {name: 'publish.message.hide', handler: hideMessage},
            {name: 'publish.message.remove', handler: removeCurrentMessage},
            {name: 'publish.message.removeAbove',
             handler: removeMessagesAbove},
            {name: 'publish.message.removeBelow',
            handler: removeMessagesBelow}
        ];

        var chatMessageMenu = [
            {name: 'chat.message.quote', handler: quoteIt},
        ];

        if ($scope.chat === true) {
            $scope.messageMenuItems = chatMessageMenu;
        }
        else {
            $scope.messageMenuItems = previewMessageMenu;
            
        }

        $scope.showMenu = function(event, message, messageIndex) {
            // calculateMenuPosition(ev);
            $timeout(function(){$scope.messageMenuApi.handleClick(event, message, messageIndex);},0);
            
        };

        function parseUrls(messageText) {
            if (messageText.match(/(http|https):/)) {

                messageText = messageText.replace(/(https?:\/\/(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpg|gif|png))/g, '<div><img class="message-image" src="$&"></div>');

                if (IS_APP) {
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

        $scope.complaint = chatHeader.partnerTitleClickHandler;

        $scope.showAdditional = function(){
            $scope.additional = true;
        };

        $scope.feedbacks = [
            {
                title: 'message.feedback.thanks',
                key: 'thanks',
                imgSrc: 'assets/img/thanks.png'
            },
            {
                title: 'message.feedback.boring',
                key: 'boring',
                imgSrc: 'assets/img/boring.png'
            },
            {
                title: 'message.feedback.disgusting',
                key: 'disgusting',
                imgSrc: 'assets/img/disgusting.png'
            }
        ];

        $scope.leaveFeedback = function(key){
            //TODO: Implement
        };
    }

})();