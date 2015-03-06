angular.module("angControllers").controller("invitationController", [
    'user', '$scope', '$stateParams',
    function(user, $scope, $stateParams) {
        $scope.invitationText = "Привет! Давай общаться в мессенджере nepotom http://linktoapp.com";

        if ($stateParams.friendIndex) {
            $scope.friend = user.friendsList.friends[+$stateParams.friendIndex];
        }

        if ($scope.friend.phoneNumbers) {
            if ($scope.friend.phoneNumbers.length > 1) {
                $scope.selectedNumber = $scope.friend.phoneNumbers[0];
            }
        }

        $scope.inviteViaSms = function() {
            console.log("invite via sms is called");
            window.plugins.socialsharing.shareViaSMS(
                invitationText, $scope.friend.phoneNumbers[0].value,
                function(msg) {console.log('ok: ' + msg)},
                function(msg) {console.log('error: ' + msg)}
            );
        };

}]);