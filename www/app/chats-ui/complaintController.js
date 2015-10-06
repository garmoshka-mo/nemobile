angular.module('angControllers').controller('complaintController', ['$scope', 'SpamFilter', 'notification', 'chats', 'chatHeader',
    function($scope, SpamFilter, notification, chats, chatHeader) {

        $scope.passOpenMenuHandler = function(openMenuHandler) {
            chatHeader.setPartnerTitleClickHandler(function() {
                if (!$scope.isComplaining) {
                    openMenuHandler();
                }
            });
        };

        $scope.complaints = [
            {
                name: 'spam',
                title: 'Спам/реклама'
            },
            {
                name: 'ignorance',
                title: 'Грубое нарушение заданных критериев беседы'
            },
            {
                name: 'insult',
                title: 'Оскорбления без причины'
            }
        ];

        $scope.reportComplaint = function(complaintName) {
            var chat = chats.getCurrentChat();
            var session = chat.getChatSessionFromStorage().then(function(){
                $scope.isComplaining = true;
                var filter = new SpamFilter(chat.lastUnexpiredChatSession);
                filter.complain(complaintName, function() {
                    notification.chatDisconnect();
                    notification.showToast('Модератор проверит чат и проучит негодяев, спасибо за уведомление!');
                    $scope.isComplaining = false;
                });
            })
        };

    }]);