var app = angular.module("angApp", ["ui.router", "angControllers", "angServices", "angFactories", "LocalForageModule", "ngTouch", "ngSanitize", "angular-gestures", "angularFileUpload", /*"ngAnimate",*/ "internationalPhoneNumber", "infinite-scroll", "ngSocial"]);
app.config(['$animateProvider', '$compileProvider', function($animateProvider, $compileProvider) {
  $animateProvider.classNameFilter(/^(?:(?!ng-animate-disabled).)*$/);
  //  Default imgSrcSanitizationWhitelist: /^\s*(https?|ftp|file):|data:image\//
  //  chrome-extension: will be added to the end of the expression
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|content):|data:image\//);
}]);
angular.module("angApp").config(["$stateProvider", "$urlRouterProvider", 
  function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("signinup/in"); 
    $stateProvider
    .state("start", {
      url: "",
      views: {
        "title": {
          template: "dub.ink"  
        },
        "menu": {
          templateUrl: "partials/menu.html"
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
          templateUrl: "partials/menu.html"
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
          templateUrl: "partials/menu.html"
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
          templateUrl: "partials/menu.html"
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
          templateUrl: "partials/menu.html"
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
          templateUrl: "partials/menu.html"
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
        "menu": {
          templateUrl: "partials/menu.html"
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
          templateUrl: "partials/menu.html"
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
          templateUrl: "partials/menu.html"
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
          templateUrl: "partials/menu.html"
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
        "menu": {
          templateUrl: "partials/menu.html"
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
          templateUrl: "partials/menu.html"
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
          templateUrl: "partials/menu.html"
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
          templateUrl: "partials/menu.html"
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
        "menu": {
          templateUrl: "partials/menu.html"
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
          templateUrl: "partials/menu.html"
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
        "menu": {
          templateUrl: "partials/menu.html"
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
        "menu": {
          templateUrl: "partials/menu.html"
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
        "menu": {
          templateUrl: "partials/menu.html"
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
        "menu": {
          templateUrl: "partials/menu.html"
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
        "menu": {
          templateUrl: "partials/menu.html"
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
        "menu": {
          templateUrl: "partials/menu.html"
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
        "menu": {
          templateUrl: "partials/menu.html"
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
        "menu": {
          templateUrl: "partials/menu.html"
        }, 
        "content": {
          controller: "preloaderController",
          templateUrl: "partials/preloader/content.html"
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
};

