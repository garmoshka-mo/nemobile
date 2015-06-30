angular.module("angControllers").controller("startController", ['user', '$state', function(user, $state) {
    if (user.isLogged()) {
        user.parseFromStorage()
        .then(
            function() {
                if (Object.keys(user.chats).length === 0) {
                    $state.go('friends');
                }
                else {
                    $state.go('chats');
                }
                
                if (window.device) {
                    navigator.splashscreen.hide();
                }
                console.log("user data is taken from storage");
            }
        );
    }
    else {
        $state.go('signin', {
            inOrUp: 'in'
        });
    }
}]);