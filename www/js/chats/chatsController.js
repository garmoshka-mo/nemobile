angular.module("angControllers").controller("chatsController", [
    'user', '$scope', '$http', '$timeout', 'api', 'notification',
    function(user, $scope, $http, $timeout, api, notification) {
        log("chats controller is invoked");
        $scope.$watch('user.chats', function() {
            if (user) {
                var chats = user.chats;
                for (var chatId in chats) {
                    chats[chatId].getLastUnexpiredChatSession();
                }
                $scope.user = user;
            }
        });

        $scope.getChatTitle = function(chat) {
            if (chat.isVirtual || !chat.senderId) {
                return "чат";
            }

            if (chat.senderId === chat.title) {
                chat.updateInfo();
                chat.title = "...";
                return chat.title;
            }
            return chat.title;
        };

        $scope.getChatPhoto = function(chat) {
            if (chat.photoUrlMini === null) {
                chat.updateInfo();
                //setting temporary photoUrlMini
                chat.photoUrlMini = App.Settings.adorableUrl + '/40/' + chat.senderId;
                chat.photoUrl = App.Settings.adorableUrl + '/' + chat.senderId;

                // log("temporary chat photo Url", chat.photoUrlMini);
                // log("get chat photo function is invoked");
                return chat.photoUrlMini;
            }
            return chat.photoUrlMini;
        };

        $scope.getFriendImage = function(friend, index) {
            var adorableLink = "http://api.adorable.io/avatars/40/";

            if (friend.photos) {
                return friend.photos[0].value;
            }

            if (friend.uuid) {
                return adorableLink + friend.uuid;
            }

            return adorableLink + index;
        };
}]);