angular.module("angControllers").controller("startController", ['user', '$state', function(user, $state) {
    
    function hideSplashScreen() {
        if (window.device) {
            setTimeout(function() {
                navigator.splashscreen.hide();
            }, 1000);
        }
    }

    if (user.isLogged()) {
        user.parseFromStorage()
        .then(
            function() {
                if (_.isEmpty(user.chats)) {
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
        })
        .then(
            hideSplashScreen
        );
    }
}]);