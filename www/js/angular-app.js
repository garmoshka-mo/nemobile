angular.module("angApp", ["ui.router", "angControllers", "angServices", "mm.foundation"]);

angular.module("angApp").config(function($stateProvider) {
  $stateProvider
  .state("start", {
    url: "",
    views: {
      "title": {
        template: "Чат 0.0.1"  
      },
      "menu": {
        templateUrl: "partials/start/menu.html"
      },
      "content": {
        templateUrl: "partials/start/content.html"
      }
    }
  })
  .state("signin", {
    url: "/signin",
    views: {
      "title": {
        template: "Авторизация"
      },
      "menu": {
        templateUrl: "partials/start/menu.html"
      }, 
      "content": {
        controller: "loginController",
        templateUrl: "partials/signin/content.html"
      }
    }
  })
  .state("signup", {
    url: "/signup",
    views: {
      "title": {
        template: "Регистрация"
      },
      "menu": {
        templateUrl: "partials/start/menu.html"
      }, 
      "content": {
        controller: "registrationController",
        templateUrl: "partials/signup/content.html"
      }
    }
  })
  .state("chats", {
    url: "/chats",
    views: {
      "title": {
        template: "Чаты"
      },
      "menu": {
        templateUrl: "partials/chats/menu.html"
      }, 
      "content": {
        controller: "chatsController",
        templateUrl: "partials/chats/content.html"
      }
    }
  })
  .state("chat", {
    url: "/chat/:senderId",
    views: {
      "title": {
        template: "Чат"
      },
      "menu": {
        templateUrl: "partials/chat/menu.html"
      }, 
      "content": {
        controller: "chatController",
        templateUrl: "partials/chat/content.html"
      }
    }
  })
  .state("exit", {
    url: "/exit",
    views: {
      "title": {
        template: "Выход"
      },
      "menu": {
        templateUrl: "partials/chat/menu.html"
      }, 
      "content": {
        controller: "exitController",
        templateUrl: "partials/exit/content.html"
      }
    }
  })
  .state("friendSearch", {
    url: "/friendSearch",
    views: {
      "title": {
        template: "Поиск друзей"
      },
      "menu": {
        templateUrl: "partials/chat/menu.html"
      }, 
      "content": {
        controller: "friendSearchController",
        templateUrl: "partials/friendSearch/content.html"
      }
    }
  })
 
});

angular.module("angApp").run(function($rootScope){
  
  // if (window.localStorage.getItem("firstTime") === null) {
  //   alert("first time");
  //   // app.pubnub.unsubscribeFromAllPushNotificationChannels();
  //   window.localStorage.setItem("firstTime", false);
  // }

  // $(".header").add(".content").toggleClass("hidden");

  // $rootScope.user = JSON.parse( window.localStorage.getItem("user") );

  // if ($rootScope.user) {
  //   app.pubnub.subscribe($rootScope.user.name);
  // } 
  // else {
  //   $rootScope.user = { name: "", friends: [], phoneNumbers: [] };
  // }


  // $(document).foundation();

  // document.addEventListener("menubutton", function(){ $('.off-canvas-wrap').foundation('offcanvas', 'toggle', 'move-right'); }, false);
  // $(document).foundation({
  //   offcanvas : {
  //     close_on_click : true
  //   }
  // });


});

angular.module("angControllers", []);
var services = angular.module("angServices", []);