var app = angular.module("angApp", ["ui.router", "angControllers", "angServices", "angFactories", "mm.foundation", "LocalForageModule", "ngTouch", "ngSanitize", "angular-gestures", "angularFileUpload"]);

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
        templateUrl: "partials/start/content.html",
        controller: "startController"
      }
    }
  })
  .state("signin", {
    url: "/signinup/:inOrUp",
    views: {
      "title": {
        template: ""
      },
      "menu": {
        templateUrl: "partials/start/menu.html"
      }, 
      "content": {
        controller: "signinupController",
        templateUrl: "partials/signinup/content.html"
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
  .state("localForage", {
    url: "/localForage",
    views: {
      "title": {
        template: "Local Forage Test"
      },
      "menu": {
        templateUrl: "partials/start/menu.html"
      }, 
      "content": {
        controller: "localForageController",
        templateUrl: "partials/localForage/content.html"
      }
    }
  })
  .state("stickersGallery", {
    url: "/stickersGallery",
    views: {
      "title": {
        template: "Галерея стикеров"
      },
      "menu": {
        templateUrl: "partials/chat/menu.html"
      }, 
      "content": {
        controller: "stickersGalleryController",
        templateUrl: "partials/stickersGallery/content.html"
      }
    }
  })
  .state("addImage", {
    url: "/addImage?imageURL&categoryId",
    views: {
      "title": {
        template: "Добавить изображение"
      },
      "menu": {
        templateUrl: "partials/chat/menu.html"
      }, 
      "content": {
        controller: "addImageController",
        templateUrl: "partials/addImage/content.html"
      }
    }
  })
});

var pushNotification;

document.addEventListener("deviceready", function(){
    console.log(">>>>>>>>>>>>>>>>>>>DEVICE READY");

    function successHandler(result) {
        console.log(result);
        // alert('result = ' + result);
    }

    function errorHandler(error) {
        console.log(result);
        // alert('error = ' + error);
    }
    pushNotification = window.plugins.pushNotification;
    if ( device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos" ){
      pushNotification.register(
      successHandler,
      errorHandler,
      {
          "senderID":"1176989379",
          "ecb": "onNotificationGCM"
      });
    }

    window.onNotificationGCM = function onNotificationGCM(e) {
      if (e.event == "registered") {
        window.deviceId = e.regid;
        registerDeviceToChannel();
      }
      else {
        console.log("new notification came", e);
        window.goToLastMessageChat = true;
      }
    }

});

angular.module("angControllers", []);
var services = angular.module("angServices", []);
var factories = angular.module("angFactories", []);

