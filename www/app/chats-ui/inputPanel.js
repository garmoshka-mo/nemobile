angular.module("angControllers")
    .controller('inputPanelController',
    ['$scope', 'separator', 'view', 'chats', 'dictionary', '$rootScope', 'userRequest', 'notification', 'gallery', 'router',
function($scope, separator, view, chats, dictionary, $rootScope, userRequest, notification, gallery, router) {

    var $chatInput = $('.chat-input');

    separator.setTopFooter($('#footer'));

    var chat = chats.getCurrent();

    var lastSession;
    chat.ensureSession()
    .then(function(session) {
        lastSession = session;
    });

    $scope.newMessage = {
        // ttl: 2592000,//30 days
        ttl: 3600,
        clearText: function() {
            $chatInput.text('');
        }
    };

    $scope.$watch('newMessage.ttl', function() {
        $scope.setFocusOnTextField();
    });

    $scope.sendMessage = function(text) {
        $scope.setFocusOnTextField();

        var textToSend = text || $chatInput.html(),
            ttl = $scope.newMessage.ttl;
        if (textToSend) {

            textToSend = gallery.parseHtml(textToSend, lastSession.type == 'external');
            if (!text) {
                $scope.newMessage.clearText();
            }

            $scope.isMessageSending = true;

            if (!lastSession.isReplied) {
                if (lastSession.creatorId != user.uuid) {
                    lastSession.setReplied();
                }
            }

            lastSession.sendMessage(textToSend, getAddress(), ttl)
                .then(
                function() {
                    $scope.handleSuccessSending();
                },
                function(res) {
                    $scope.handleFailedSending(res);
                }
            )
                //doubling function because .finally doesn't work on android 2.2
                .then(afterSent, afterSent);

            function afterSent() {
                $scope.appropriateStickers = [];
                $scope.isMessageSending = false;
            }

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
        notification.activateWindow();

        chat.iStartedInput = true;
        if (chat.type == 'internal') {
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
        if ($scope.image.file) {
            $scope.isMessageSending = true;
            userRequest.sendFile(
                'POST',
                '/images/load_image',
                {image: {image_data: $scope.image.file}}
            )
            .then(function(res){
                localStorage.setItem('recentlySentPic', res.url);
                $scope.sendMessage(res.url);
            }).then(function(){
                $scope.isMessageSending = false;
            });
        }
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
        if (IS_APP) {
            window.cordova.plugins.Keyboard.show();
        }
    });

    function quoteMessage(message) {
        $chatInput.html($chatInput.html() +
            ' > ' + message.text + ' < = ');
    }

    $rootScope.$on('quote message', function(event, args) {
        quoteMessage(args.message);
    });

    $scope.setFocusOnTextField();

    $scope.toggleGalleryPanel = function() {
        gallery.galleryPanelOpened = !gallery.galleryPanelOpened;
        setTimeout(function() {
            separator.updateElements();
            separator.updateRestrictions();
        }, 0);
    };
    $scope.toggleGallery = function() {
        if(gallery.galleryOpened) {
            router.goBack();
        }
        else {
            router.goto('gallery');
        }
        gallery.galleryOpened = !gallery.galleryOpened;
    };

    $scope.$on("$destroy", function() {
        gallery.galleryPanelOpened = false;
    });
    gallery.setSendMessageHandler($scope.sendMessage, chat);
    gallery.setInput($chatInput, $scope.newMessage);

    //check timer issue
    setTimeout(function() {
        if(!$rootScope.notification.time) {
            error('Timer did not start!')
        }
    }, 3000)

    $chatInput.on("paste", function(e) {
        try {
            // get text representation of clipboard
            var text = e.originalEvent.clipboardData.getData("text/plain");
            // insert text manually
            document.execCommand("insertHTML", false, text);
            // cancel paste
            e.preventDefault();
        } catch(e) {
            error(e);
        }
    });
    $chatInput.on("drop", function(e) {
        try {
            var text = e.originalEvent.dataTransfer.getData("text/plain");
            document.execCommand("insertHTML", false, text);
            e.preventDefault();
        } catch (e) {
            error(e);
        }
    });
}]);