angular.module("angControllers").controller("startController", ['user', '$state', function(user, $state) {
    
    function hideSplashScreen() {
        if (window.device) {
            navigator.splashscreen.hide();
        }
    }

    if (user.isLogged()) {
        user.parseFromStorage()
        .then(
            function() {
                if (Object.keys(user.chats).length === 0) {
                    $state.go('friends')
                    .then(
                        hideSplashScreen
                    );
                }
                else {
                    $state.go('chats')
                    .then(
                        hideSplashScreen
                    );
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