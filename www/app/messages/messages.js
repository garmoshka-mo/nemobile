(function(){
    app.directive('messages', function() {
        return {
            scope: {source: '='},
            templateUrl: "app/messages/messages.html",
            controller: ['$scope', '$element', controller]
        };
    });

    function controller($scope, $element) {
        $scope.formatMessage = function(message) {
            var messageText = message.text, html;


            if (message.type) {
                // For debug:
                if (message.type =='chat_finished')
                    html = '<b>Собеседник покинул чат</b>';
                else if (message.type == 'chat_empty')
                    html = '<b>Этот чат завершен</b>';


                '<a href="#/random">Начать новый диалог</a>'
                html = '<div class="123">'+text+'</div>'+
                    '<share></share>';
            }

            if (messageText.match(/(http|https):/)) {

                messageText = messageText.replace(/(https?:\/\/(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpg|gif|png))/g, '<img src="$&">');

                if (RAN_AS_APP) {
                    messageText = messageText.replace(/https?:\/\/(?![^" ]*(?:jpg|png|gif))[^" ]+/g, "<span class='message-link' onclick='navigator.app.loadUrl(\"$&\",{openExternal: true});'>$&</span>");
                }
                else {
                    messageText = messageText.replace(/https?:\/\/(?![^" ]*(?:jpg|png|gif))[^" ]+/g, "<a class='message-link' target='_blank' href='$&'>$&</a>");
                }
                return $sce.trustAsHtml(messageText);
            }
            else {
                return messageText;
            }
        };
    }

})();