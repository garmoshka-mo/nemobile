angular.module("angControllers").controller("invitationController", [
    'user', '$scope', '$stateParams',
    function(user, $scope, $stateParams) {
        var invitationText = "Привет! Давай общаться в мессенджере nepotom http://linktoapp.com";

        if ($stateParams.friendIndex) {
            $scope.friend = user.friendsList.friends[+$stateParams.friendIndex];
        }

        $scope.inviteViaSms = function() {
            console.log("invite via sms is called");
            window.plugins.socialsharing.shareViaSMS(
                invitationText, $scope.friend.phoneNumbers[0].value,
                function(msg) {console.log('ok: ' + msg)},
                function(msg) {alert('error: ' + msg)}
            );
        };

}]);