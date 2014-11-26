angular.module("angApp", ["ngRoute", "angControllers"]);

angular.module("angApp").config(function($locationProvider, $routeProvider){
  $routeProvider
  .when("/", {
    controller: "mainCtrl"
  })
  // .when("/loginOrRigister", {
  //   controller: "loginRegistrationCtrl",
  //   templateUrl: "partials/sign-buttons.html"
  // })
  // .when("/friends", {
  //   controller: "friendsCtrl",
  //   templateUrl: "partials/friends.html"
  // })
  // ;
});

angular.module("angApp").run(function($rootScope){

  if (window.localStorage.getItem("firstTime") === null) {
    alert("first time");
    app.pubnub.unsubscribeFromAllPushNotificationChannels();
    window.localStorage.setItem("firstTime", false);
  }

  $(".header").add(".content").toggleClass("hidden");

  $rootScope.user = JSON.parse( window.localStorage.getItem("user") );

  if ($rootScope.user) {
    app.pubnub.subscribe($rootScope.user.name);
  } 
  else {
    $rootScope.user = { name: "", friends: [], phoneNumbers: [] };
  }


  $(document).foundation();

  document.addEventListener("menubutton", function(){ $('.off-canvas-wrap').foundation('offcanvas', 'toggle', 'move-right'); }, false);
  $(document).foundation({
    offcanvas : {
      close_on_click : true
    }
  });


});

angular.module("angControllers", []);