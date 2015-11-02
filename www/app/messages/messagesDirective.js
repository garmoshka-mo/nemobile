(function(){
angular.module("angApp").directive('messages', function() {
return {
    scope: {session: '=', lookAgain: '&', chatSettings: '&', chat: '='},
    templateUrl: "app/messages/messages.html?"+version,
    controller: ['$scope', '$postpone', 'view', 'chatHeader', 'messageMenu',
        '$sce', '$timeout', '$rootScope', 'socket', 'emoji',
function ($scope, $postpone, view, chatHeader, messageMenu,
          $sce, $timeout, $rootScope, socket, emoji) {
    
    $scope.formatMessage = function(message) {
        return parseUrls(message.text);
    };

    function quoteIt(messageIndex) {
        $rootScope.$broadcast('quote message',
            {message: $scope.session.messages[messageIndex]});
    }

    function removeCurrentMessage(messageIndex) {
        $scope.session.messages.splice(messageIndex, 1);
    }

    function removeMessagesAbove(messageIndex) {
        $scope.session.messages.splice(0, messageIndex);
    }

    function removeMessagesBelow(messageIndex) {
        $scope.session.messages = $scope.session.messages.slice(0, messageIndex + 1);
    }

    function hideMessage(messageIndex) {
        var message = $scope.session.messages[messageIndex];
        message.type = 'hidden';
        message.text = '';
    }

    function editMessage(messageIndex) {
        var message = $scope.session.messages[messageIndex];
        $('#edit-message-trigger').click();
        $rootScope.message = message;
    }

    var menuItems = $scope.chat ?
        [
            {name: 'chat.message.quote', handler: quoteIt}
        ]:
        [
            {name: 'publish.message.edit', handler: editMessage},
            {name: 'publish.message.hide', handler: hideMessage},
            {name: 'publish.message.remove', handler: removeCurrentMessage},
            {name: 'publish.message.removeAbove', handler: removeMessagesAbove},
            {name: 'publish.message.removeBelow', handler: removeMessagesBelow}
        ];
    $scope.showMenu = messageMenu.showMenu.bind(null, menuItems);

    function parseUrls(messageText) {
        messageText = emoji.parse(messageText);
        if (messageText.match(/(http|https):/)) {

            messageText = messageText.replace(/(https?:\/\/(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpg|gif|png))/g, '<div><img class="message-image" src="$&"></div>');

            if (IS_APP) {
                messageText = messageText.replace(/https?:\/\/(?![^" ]*(?:jpg|png|gif))[^" ]+/g, "<span class='message-link' onclick='navigator.app.loadUrl(\"$&\",{openExternal: true});'>$&</span>");
            }
            else {
                messageText = messageText.replace(/https?:\/\/(?![^" ]*(?:jpg|png|gif))[^" ]+/g, "<a class='message-link' target='_blank' href='$&'>$&</a>");
            }
            return $sce.trustAsHtml(messageText);
        } else if (messageText.match(/gfy:(\w+)/g)) {
            var gfyRegexp = /gfy:(\w+)/g;
            var match = gfyRegexp.exec(messageText);
            log(match[1]);
            var autoplay = IS_MOBILE ? "data-autoplay='false'" : "";
            messageText = messageText.replace(gfyRegexp,"<img class='gfyitem' " + autoplay + " data-id='"+ match[1] +"'/>");
            setTimeout(function() { gfyCollection.init(); } , 200);
            return $sce.trustAsHtml(messageText);
        } else {
            return messageText;
        }
    }
    
    $scope.complaint = chatHeader.partnerTitleClickHandler;

    $scope.showFeedbackOptions = function(){
        view.scrollDownTopSection();
        $scope.additional = true;
    };

    $scope.feedbacks = [
        {
            title: 'feedback.thanks',
            key: 'thanks',
            imgSrc: 'assets/img/circle-menu-thanks.png'
        },
        {
            title: 'feedback.boring',
            key: 'boring',
            imgSrc: 'assets/img/circle-menu-boring.png'
        },
        {
            title: 'feedback.disgusting',
            key: 'disgusting',
            imgSrc: 'assets/img/circle-menu-unpleasant.png'
        }
    ];

    $scope.leaveFeedback = function(f){
        $postpone(500, function() {
            $scope.additional = false;
            $scope.feedbackLeft = f.imgSrc;
        });
        $scope.selectedKey = f.key;
        socket.emit('feedback', { channel: $scope.session.chat.channel, feedback: f.key });
    };
}]
};
});

})();