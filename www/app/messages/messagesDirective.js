(function(){
    app.directive('messages', function() {
        return {
            scope: {session: '='},
            templateUrl: "app/messages/messages.html",
            controller: ['$scope', '$element', '$sce', controller]
        };
    });

    function controller($scope, $element, $sce) {

        $scope.showSharing = false;

        $scope.formatMessage = function(message) {
            return parseUrls(message.text);
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