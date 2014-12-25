angular.module("angControllers").controller("startController", ['user', '$state', function(user, $state) {
    
    if (user.isLogged()) {
      $state.go('chats');
    }
    else {
      $state.go('start');
    }
    
}])