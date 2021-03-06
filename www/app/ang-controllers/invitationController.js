angular.module("angControllers").controller("invitationController", [
    'user', '$scope', '$stateParams',
    function(user, $scope, $stateParams) {

        function onSuccess() {
            log('share ok');
        }

        function onError(msg) {
            alert('error: ' + msg);
        }

        var chat = user.chats[$stateParams.senderId];
        $scope.link = config('appUrl') + "/#/virtualChat?at=" + chat.link;
        // $scope.link = "http://localhost:3000" + "/#/virtualChat?at=" + chat.link;
        $scope.invitationText = "Привет! Давай общаться в мессенджере dub.ink " + $scope.link;

        if ($stateParams.friendIndex) {
            $scope.friend = user.friendsList.friends[+$stateParams.friendIndex];

            if ($scope.friend.phoneNumbers) {
                if ($scope.friend.phoneNumbers.length > 1) {
                    $scope.selectedNumber = $scope.friend.phoneNumbers[0];
                }
            }
        }

        

        $scope.inviteViaSms = function() {
            log("invite via sms is called");
            window.plugins.socialsharing.shareViaSMS(
                invitationText, $scope.friend.phoneNumbers[0].value,
                function(msg) {log('ok: ' + msg);},
                function(msg) {log('error: ' + msg);}
            );
        };

        $scope.inviteViaSocialNetwork = function(networkName) {
            var platform = device.platform;
            switch(networkName) {
                
                case "twitter":
                    window.plugins.socialsharing.shareViaTwitter($scope.invitationText);
                break;

                case "vk": {
                    if (platform === "iOS") {
                        window.plugins.socialsharing.shareVia('com.apple.social.vk', $scoe.invitationText, null, null, null, onSuccess, onError);
                    }
                    else if (platform === "Android") {
                        window.plugins.socialsharing.shareVia('vk', $scoe.invitationText, null, null, null, onSuccess, onError);
                    }
                }
                break;

                case "facebook": 
                    window.plugins.socialsharing.shareViaFacebook($scope.invitationText, null, null, onSuccess, onError);
                break;

                case "googlePlus": 

                break;

                case "email":
                    var emailToSend = null; 
                    if ($scope.friend.emails) {
                        emailToSend = $scope.friend.emails[0].value;
                    }
                    window.plugins.socialsharing.shareViaEmail(
                      $scope.invitationText,
                      'Приглашение',
                      emailToSend,
                      null,
                      null,
                      null,
                      onSuccess, 
                      onError 
                    );
                break;
            }
        };

        $scope.openSocialShareMenu = function() {
            window.plugins.socialsharing.share($scope.invitationText);
        };

}]);