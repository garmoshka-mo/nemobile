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
                title: 'complaints.spam'
            },
            {
                name: 'ignorance',
                title: 'complaints.ignorance'
            },
            {
                name: 'insult',
                title: 'complaints.insult'
            }
        ];

        $scope.reportComplaint = function(complaintName) {
            var chat = chats.current;
            var session = chat.getLastUnexpiredChatSession().then(function(){
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