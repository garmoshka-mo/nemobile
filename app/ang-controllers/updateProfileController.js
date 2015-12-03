angular.module("angControllers").controller("updateProfileController", [
    'user', '$scope', '$http', '$state', 'api', '$stateParams', 'dictionary',
    function(user, $scope, $http, $state, api, $stateParams, dictionary){
        $scope.user = user;
        $scope.showSpinner = false;

        if (user.isVirtual) {
            $scope.profile = {};
        }
        else {
            $scope.profile = {
                name: user.name
            };
        }

        $scope.updateProfile = function() {
            var nameToSend = null;
            $scope.showSpinner = true;

            if ($scope.profile.name != user.name) {
                nameToSend = $scope.profile.name;
            }
            
            user.updateProfile(nameToSend, $scope.profile.password)
            .then(
                function() {
                    $scope.serverResponse = "изменения внесены";
                },
                function(res) {
                    $scope.serverResponse = dictionary.get(res);
                }
            )
            .then(
                function() {
                    $scope.showSpinner = false;
                }
            );
        };    
}]); 