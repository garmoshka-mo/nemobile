angular.module("angControllers").controller("mainCtrl", 
  function($rootScope, $scope, $http, $location, $state, notification, api, storage, User, ChatSession){
  
  console.log('main controller is invoked')

  $rootScope.isAppInBackground = false;

  document.addEventListener("pause", function() {
     $rootScope.isAppInBackground = true;
  });
  document.addEventListener("resume", function() {
     $rootScope.isAppInBackground = false;
  });
  document.addEventListener("deviceready", function() {
     // cordova.plugins.backgroundMode.enable();
  });

  $scope.openMenu = function() {
    console.log("swipe open");
    $('.off-canvas-wrap').foundation('offcanvas', 'show', 'move-right');
  }

  $scope.closeMenu = function() {
    console.log("swipe close");
    $('.off-canvas-wrap').foundation('offcanvas', 'hide', 'move-right');
  }
  
  $scope.$on('$stateChangeStart',
    function(evt, toState, toParams, fromState, fromParams) {
    notification.clear();
  });

  $scope.getDataFromStorage = function() {
    storage.getUser()
    .then(function(res) {
      $rootScope.user = User.parseFromStorage(res);
      console.log('user data is taken from storage');
      api.subscribe($rootScope.user.channel);
    })
    .then(function() {
      storage.getFriends()
      .then(function(res) {
        $rootScope.user.friends = res;
      })
    })
    .then(function(){
      storage.getChats()
      .then(function(res) {
        $rootScope.user.chats = User.parseChatsFromStorage(res);
        console.log($rootScope.user);
      })
    })
    .then(function() {
    })
  }


  $scope.isLogged = function() {
    return !!localStorage.getItem('isLogged')
  }



  if ($scope.isLogged()) {
      $scope.getDataFromStorage();
      $state.go('chats');
    }
    else {
      $state.go('start');
    }


});