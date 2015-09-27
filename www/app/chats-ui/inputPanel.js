angular.module("angControllers")
    .controller('inputPanelController',
    ['$scope', 'separator', 'view', 'chats',
function($scope, separator, view, chats) {

    var $chatInput = $('.chat-input');

    separator.setTopFooter($('#footer'));

    var params = chats.ensureParams();
    if (!params) return;

    var type = params.type;
    var chat = chats.ensureCurrentChat();

    var lastSession;
    chat.ensureSession(function(session) {
        lastSession = session;
    });

    $scope.newMessage = {
        text: '',
        // ttl: 2592000,//30 days
        ttl: $scope.isRandom ? 0 : 3600,
        clearText: function() {
            this.text = '';
        }
    };

    $scope.$watch('newMessage.ttl', function() {
        $scope.setFocusOnTextField();
    });

    $scope.sendMessage = function(text) {
        $scope.setFocusOnTextField();

        var textToSend = text || $scope.newMessage.text;
        if (textToSend) {

            $scope.isMessageSending = true;

            if (!lastSession.isReplied) {
                if (lastSession.creatorId != user.uuid) {
                    lastSession.setReplied();
                }
            }

            lastSession.sendMessage(textToSend, getAddress(), $scope.newMessage.ttl)
                .then(
                function() {
                    $scope.handleSuccessSending();
                },
                function(res) {
                    $scope.handleFailedSending(res);
                }
            )
                .then( //doubling function because .finally doesn't work on android 2.2
                function() {
                    $scope.newMessage.clearText();
                    $scope.appropriateStickers = [];
                    $scope.isMessageSending = false;
                },
                function() {
                    $scope.newMessage.clearText();
                    $scope.isMessageSending = false;
                }
            );
        }
    };

    $scope.handleSuccessSending = function() {

        if (!lastSession.messages.length) {
            lastSession.creatorId = user.uuid;
        }

        $scope.isFirstMessage = false;
        $scope.errorDescription = "";

        // log("user:", user);
    };

    $scope.handleFailedSending = function(errorDescription) {
        $scope.errorDescription = dictionary.get(errorDescription);
    };

    function getAddress() {
        if (chat.channel)
            return {channel: chat.channel};

        if (chat.senderId)
            return {uuid: chat.senderId};
    }

    $scope.input_keypress = function(event) {
        $scope.showDisconnect = false;
        if (type == 'internal') {
            detectUserTyping();
        }
        //if ctrl+enter or enter is pressed
        if ((event.keyCode == 10 || event.keyCode == 13) && event.ctrlKey || event.keyCode == 13) {
            event.preventDefault();
            $scope.sendMessage();
        } else
            chat.typing();
    };

    $scope.uploadImage = function() {
        $scope.isMessageSending = true;
        api.uploadImage($scope.image.file[0]).then(function(res){
            $scope.sendMessage(res.url);
        }).then(function(){
            $scope.isMessageSending = false;
        });
    };


    $scope.setFocusOnTextField = function() {
        setTimeout(function() {
            $chatInput.focus();
        }, 0);
    };

    var typingTimeout;
    var userTyping = false;
    function detectUserTyping() {
        if (userTyping) {
            prolongTyping();
        }
        else {
            log('current user started typing');
            userTyping = true;
            chats.setTypingStatus(true, chat.channel, user.uuid);
            prolongTyping();
        }
    }

    function prolongTyping() {
        clearTimeout(typingTimeout);

        typingTimeout = setTimeout(function() {
            log('current user stopped typing');
            userTyping = false;
            chats.setTypingStatus(false, chat.channel, user.uuid);
        }, 1000);
    }

    $scope.onInputFieldFocus = function() {
        view.scrollDownTopSection();
    };


    $chatInput.focus(function() {
        if (RAN_AS_APP) {
            window.cordova.plugins.Keyboard.show();
        }
    });

    $scope.setFocusOnTextField();

}]);