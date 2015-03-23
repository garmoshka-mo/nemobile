var app = angular.module("angApp", ["ui.router", "angControllers", "angServices", "angFactories", "mm.foundation", "LocalForageModule", "ngTouch", "ngSanitize", "angular-gestures", "angularFileUpload", /*"ngAnimate",*/ "internationalPhoneNumber", "infinite-scroll"]);
app.config(['$animateProvider', '$compileProvider', function($animateProvider, $compileProvider) {
  $animateProvider.classNameFilter(/^(?:(?!ng-animate-disabled).)*$/);
  //  Default imgSrcSanitizationWhitelist: /^\s*(https?|ftp|file):|data:image\//
  //  chrome-extension: will be added to the end of the expression
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|content):|data:image\//);
}]);
angular.module("angApp").config(["$stateProvider", function($stateProvider) {
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
    url: "/chat?senderId&messageText",
    views: {
      "title": {
        template: "Чат"
      },
      "menu": {
        templateUrl: "partials/chats/menu.html"
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
        templateUrl: "partials/chats/menu.html"
      }, 
      "content": {
        controller: "exitController",
        templateUrl: "partials/exit/content.html"
      }
    }
  })
  .state("friendSearch", {
    url: "/friendSearch?stringToSearch",
    views: {
      "title": {
        template: "Поиск друзей"
      },
      "menu": {
        templateUrl: "partials/chats/menu.html"
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
    url: "/stickersGallery?fromChat",
    views: {
      "title": {
        template: "Галерея стикеров"
      },
      "menu": {
        templateUrl: "partials/chats/menu.html"
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
        templateUrl: "partials/chats/menu.html"
      }, 
      "content": {
        controller: "addImageController",
        templateUrl: "partials/addImage/content.html"
      }
    }
  })
  .state("friends", {
    url: "/friends",
    views: {
      "title": {
        template: "Друзья"
      },
      "menu": {
        templateUrl: "partials/chats/menu.html"
      }, 
      "content": {
        controller: "friendsController",
        templateUrl: "partials/friends/content.html"
      }
    }
  })
  .state("phoneRegistration", {
    url: "/phoneRegistration",
    views: {
      "title": {
        template: "Регистрация номера"
      },
      "menu": {
        templateUrl: "partials/start/menu.html"
      }, 
      "content": {
        controller: "phoneRegistrationController",
        templateUrl: "partials/phoneRegistration/content.html"
      }
    }
  })
  .state("phoneRegistrationUser", {
    url: "/phoneRegistrationUser",
    views: {
      "title": {
        template: "Регистрация номера"
      },
      "menu": {
        templateUrl: "partials/chats/menu.html"
      }, 
      "content": {
        controller: "phoneRegistrationUserController",
        templateUrl: "partials/phoneRegistrationUser/content.html"
      }
    }
  })
  .state("settings", {
    url: "/settings",
    views: {
      "title": {
        template: "Настройки"
      },
      "menu": {
        templateUrl: "partials/chats/menu.html"
      }, 
      "content": {
        controller: "settingsController",
        templateUrl: "partials/settings/content.html"
      }
    }
  })
  .state("invitation", {
    url: "/invitation?friendIndex",
    views: {
      "title": {
        template: "Приглашение"
      },
      "menu": {
        templateUrl: "partials/chats/menu.html"
      }, 
      "content": {
        controller: "invitationController",
        templateUrl: "partials/invitation/content.html"
      }
    }
  })
  .state("loadAvatar", {
    url: "/loadAvatar",
    views: {
      "title": {
        template: "Загрузка аватарки"
      },
      "menu": {
        templateUrl: "partials/chats/menu.html"
      }, 
      "content": {
        controller: "loadAvatarController",
        templateUrl: "partials/loadAvatar/content.html"
      }
    }
  })
}]);

var pushNotification;


document.addEventListener("deviceready", function() {
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
    
    if (device.platform == 'iOS') {

      var webViewShrunkEvent = new CustomEvent("webViewShrunk");
      // var $body = $('body');
      // var $footer = $('#footer');

      window.webViewShrinker = {
        normalHeight: null,
        footer: null,
        body: null,
        shrink: function(pixelsToShrink) {
          if (!this.normalHeight) {
            this.normalHeight = $('body').height();
          }
          console.log('body normal height', this.normalHeight);
          $('body').height(this.normalHeight - pixelsToShrink);
          $('#footer').css('bottom', pixelsToShrink + 'px');
          console.log('webview is shrunk on(px)', pixelsToShrink);
          document.dispatchEvent(webViewShrunkEvent);
        },
        unshrink: function() {
          $('body').height(this.normalHeight);
          $('#footer').css('bottom','0rem');
        } 
      };
      
      cordova.plugins.Keyboard.disableScroll(true);
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      
      window.addEventListener('native.keyboardshow', keyboardShowHandler);
      window.addEventListener('native.keyboardhide', keyboardHideHandler);


      function keyboardShowHandler(e){
        window.webViewShrinker.shrink(e.keyboardHeight);
      }

      function keyboardHideHandler(){
        window.webViewShrinker.unshrink();
      }
      
      pushNotification.register(tokenHandler, errorHandler, {
          'badge': 'true',
          'sound': 'true',
          'alert': 'true',
          'ecb': 'onNotificationAPN'
      });

      function tokenHandler(deviceToken) {
        window.deviceId = deviceToken;
        window.registerDeviceToChannel(deviceToken);
      }

      function errorHandler(error) {
        alert(error);
      }
      
      window.onNotificationAPN = function(e) {
        console.log("apn notification", e);
        
        //if coldstart
        if (e.foreground === "0" && !window.isGotUnseenMessage) {
          window.goToLastMessageChat = true;
          return;
        }
        
        //if app was in background
        if (e.foreground === "0") {
          location.href = "#/chat?senderId=" + e.uuid;
        }
      };
    }

    if (device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos") {
      pushNotification.register(
      successHandler,
      errorHandler,
      {
          "senderID":"1176989379",
          "ecb": "onNotificationGCM"
      });

      window.onNotificationGCM = function onNotificationGCM(e) {
        console.log(e);
        if (e.event == "registered") {
          window.deviceId = e.regid;
          registerDeviceToChannel(); 
        }
        else {
          if (e.coldstart) {
            window.goToLastMessageChat = true;
          }
          else if (!e.foreground) {
            location.href = "#/chat?senderId=" + e.payload.uuid;
          }
        }
      };
    }
});



angular.module("angControllers", []);
var services = angular.module("angServices", []);
var factories = angular.module("angFactories", []);

window.onload = function onLoad() {
  angular.bootstrap(document, ['angApp']);
}

