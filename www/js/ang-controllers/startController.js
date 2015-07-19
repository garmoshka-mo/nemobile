angular.module("angControllers").controller("startController", ['user', '$state', function(user, $state) {
    
    function hideSplashScreen() {
        if (RAN_AS_APP) {
            setTimeout(function() {
                navigator.splashscreen.hide();
            }, 1000);
        }
    }

    if (user.isLogged() && RAN_AS_APP) {
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

        $state.go('homepage');

        // todo: На сайн-ин редиректим только если мы не залогинены еще
        //  сейчас долгая пляска с переключениями при загрузке происходит
        // Прелоадер, потом форма логина, потом форма чата
        $state.go('signin', {
            inOrUp: 'in'
        })

        .then(
            hideSplashScreen
        );
    }
}]);