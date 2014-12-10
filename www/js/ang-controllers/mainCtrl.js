angular.module("angControllers").controller("mainCtrl", function($rootScope, $scope, $http, $location, $state, notification){
  
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

});