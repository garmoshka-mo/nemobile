var app = angular.module("angApp", ["ui.router", "angControllers", "angServices", "angFactories",
  "LocalForageModule", "ngTouch", "ngSanitize", "angular-gestures", "angularFileUpload", /*"ngAnimate",*/
  "internationalPhoneNumber", "infinite-scroll", "ngSocial", "ngMaterial"]);
app.config(['$animateProvider', '$compileProvider', function($animateProvider, $compileProvider) {
  $animateProvider.classNameFilter(/^(?:(?!ng-animate-disabled).)*$/);
  //  Default imgSrcSanitizationWhitelist: /^\s*(https?|ftp|file):|data:image\//
  //  chrome-extension: will be added to the end of the expression
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|content):|data:image\//);
}]);
angular.module("angApp").config(["$stateProvider", "$urlRouterProvider",
  function($stateProvider, $urlRouterProvider) {
    //$urlRouterProvider.otherwise("signinup/in");
    // $animate.enabled(false);
    $stateProvider
    .state("start", {
      url: "",
      views: {
        "title": {
          template: "dub.ink"  
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
        "content": {
          controller: "chatsController",
          templateUrl: "partials/chats/content.html"
        }
      }
    })
    .state("chat", {
      url: "/chat?channelName&messageText&senderId&fromState",
      views: {
        "title": {
          template: "Чат"
        },
        "content": {
          controller: "chatController",
          templateUrl: "partials/chat/content.html"
        }
      }
    })
    .state("random", {
      url: "/random",
      views: {
        "title": {
          template: "Чат наугад - DUB.INK"
        },
        "content": {
          controller: "randomController",
          templateUrl: "partials/random/content.html"
        }
      }
    })
    .state("exit", {
      url: "/exit",
      views: {
        "title": {
          template: "Выход"
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
          template: "Поиск контакта"
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
          template: "Контакты"
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
        "content": {
          controller: "settingsController",
          templateUrl: "partials/settings/content.html"
        }
      }
    })
    .state("invitation", {
      url: "/invitation?friendIndex&senderId",
      views: {
        "title": {
          template: "Приглашение"
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
        "content": {
          controller: "loadAvatarController",
          templateUrl: "partials/loadAvatar/content.html"
        }
      }
    })
    .state("showImage", {
      url: "/showImage?link",
      views: {
        "title": {
          template: "Просмотр изображения"
        },
        "content": {
          controller: "showImageController",
          templateUrl: "partials/showImage/content.html"
        }
      }
    })
    .state("addVirtualChat", {
      url: "/addVirtualChat?friendIndex",
      views: {
        "title": {
          template: "Создание чата"
        },
        "content": {
          controller: "addVirtualChatController",
          templateUrl: "partials/addVirtualChat/content.html"
        }
      }
    })
    .state("chatInfo", {
      url: "/chatInfo?senderId",
      views: {
        "title": {
          template: "Информация о чате"
        },
        "content": {
          controller: "chatInfoController",
          templateUrl: "partials/chatInfo/content.html"
        }
      }
    })
    .state("about", {
      url: "/about/:page",
      views: {
        "title": {
          template: "О программе"
        },
        "content": {
          controller: "aboutController",
          templateUrl: "partials/about/content.html"
        }
      }
    })
    .state("virtualChat", {
      url: "/virtualChat?at",
      views: {
        "title": {
          template: "Виртуальный чат"
        },
        "content": {
          controller: "virtualChatController",
          templateUrl: "partials/virtualChat/content.html"
        }
      }
    })
    .state("updateProfile", {
      url: "/updateProfile",
      views: {
        "title": {
          template: "Обновления профиля"
        },
        "content": {
          controller: "updateProfileController",
          templateUrl: "partials/updateProfile/content.html"
        }
      }
    })
    .state("vkLogin", {
      url: "/vkLogin?access_token$expires_in&user_id",
      views: {
        "title": {
          template: "Обновления профиля"
        },
        "content": {
          controller: "vkLoginController",
          templateUrl: "partials/vkLogin/content.html"
        }
      }
    })
    .state("preloader", {
      url: "/preloader/:stateToGo",
      views: {
        "title": {
          template: ""
        },
        "content": {
          controller: "preloaderController",
          templateUrl: "partials/preloader/content.html"
        }
      }
    })
    .state("homepage", {
      url: "/homepage",
      views: {
        "title": {
          template: "dubink"
        },
        "content": {
          controller: "homepageController",
          templateUrl: "partials/homepage/content.html"
        }
      }
    })
    .state("createFastChat", {
      //Fast Chat is a chat between two virtual users
      url: "/createFastChat?senderId",
      views: {
        "title": {
          template: "Создание быстрого чата"
        },
        "content": {
          controller: "createFastChatController",
          templateUrl: "partials/createFastChat/content.html"
        }
      }
    })
    // .state("updateProfile", {
    //   url: "/updateProfile",
    //   views: {
    //     "title": {
    //       template: "Обновления профиля"
    //     },
    //     "menu": {
    //       templateUrl: "partials/menu.html"
    //     }, 
    //     "content": {
    //       controller: "updateProfileController",
    //       templateUrl: "partials/updateProfile/content.html"
    //     }
    //   }
    // })
}]);

var pushNotification;

var RAN_AS_APP = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

document.addEventListener("deviceready", function() {
    console.log(">>>>>>>>>>>>>>>>>>>DEVICE READY");
    console.log("OS version: " + window.device.version);
    
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

      navigator.splashscreen.hide();
      //shrink webiew
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
          $('#footer').css('position', 'relative');
          console.log('webview is shrunk on(px)', pixelsToShrink);
          document.dispatchEvent(webViewShrunkEvent);
        },
        unshrink: function() {
          $('body').height(this.normalHeight);
          // $('#footer').css('position','fixed');
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
      
      // ios push notifications
      pushNotification.register(tokenHandler, errorHandler, {
          'badge': 'true',
          'sound': 'true',
          'alert': 'true',
          'ecb': 'onNotificationAPN'
      });

      function tokenHandler(deviceToken) {
        window.deviceId = deviceToken;
        // window.registerDeviceToChannel(deviceToken);
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
          // registerDeviceToChannel(); 
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

String.prototype.sanitize = function() {
  return this.replace(/[\u00A0-\u9999<>&]/gim, function(i) {
    return '&#'+i.charCodeAt(0)+';';
  });
};

window.onload = function onLoad() {
  angular.bootstrap(document, ['angApp']);
};
$(window).bind('beforeunload', function() {
  ga('send', 'event', 'page', 'close');
});
