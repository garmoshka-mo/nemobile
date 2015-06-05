angular.module("angControllers").controller("startController", ['user', '$state', function(user, $state) {
    if (user.isLogged()) {
        if (Object.keys(user.chats).length === 0) {
            $state.go('friends');
        }
        else {
            $state.go('chats');
        }
    }
    else {
        $state.go('signin', {
            inOrUp: 'in'
        });
    }
}]);