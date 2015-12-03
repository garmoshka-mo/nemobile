angular.module('angControllers').controller('complaintController', ['$scope', 'SpamFilter', 'notification', 'chats',
    function($scope, SpamFilter, notification, chats) {

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
            var chat = chats.getCurrent();
            var session = chat.getLastUnexpiredChatSession().then(function(){
                $scope.isComplaining = true;
                var filter = new SpamFilter(chat.lastUnexpiredChatSession);
                filter.complain(complaintName, function() {
                    notification.chatDisconnect(null, 'complaintSuccess');
                    $scope.isComplaining = false;
                });
            })
        };

        $(document).foundation('dropdown', 'reflow');

    }]);