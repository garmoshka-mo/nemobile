var app = angular.module("angApp", ["ui.router", "angControllers", "angServices", "angFactories",
  "LocalForageModule", "ngTouch", "ngSanitize", "angular-gestures", "angularFileUpload", /*"ngAnimate",*/
  "internationalPhoneNumber", "infinite-scroll", "ngSocial", "ngMaterial", 'ngResource']);
app.config(['$animateProvider', '$compileProvider', function($animateProvider, $compileProvider) {
  $animateProvider.classNameFilter(/^(?:(?!ng-animate-disabled).)*$/);
  //  Default imgSrcSanitizationWhitelist: /^\s*(https?|ftp|file):|data:image\//
  //  chrome-extension: will be added to the end of the expression
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|content):|data:image\//);
}]);
var version = 'dev';
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
          templateUrl: "partials/start/content.html?"+version,
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
          templateUrl: "partials/signinup/content.html?"+version
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
          templateUrl: "partials/signup/content.html?"+version
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
          templateUrl: "partials/chats/content.html?"+version
        }
      }
    })
    .state("chat", {
      url: "/chat?channelName&messageText&senderId&fromState&chatType",
      views: {
        "title": {
          template: "Чат"
        },
        "content": {
          controller: "chatController",
          templateUrl: "partials/chat/content.html?"+version
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
          templateUrl: "partials/random/content.html?"+version
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
          templateUrl: "partials/exit/content.html?"+version
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
          templateUrl: "partials/friendSearch/content.html?"+version
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
          templateUrl: "partials/localForage/content.html?"+version
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
          templateUrl: "partials/stickersGallery/content.html?"+version
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
          templateUrl: "partials/addImage/content.html?"+version
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
          templateUrl: "partials/friends/content.html?"+version
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
          templateUrl: "partials/phoneRegistration/content.html?"+version
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
          templateUrl: "partials/phoneRegistrationUser/content.html?"+version
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
          templateUrl: "partials/settings/content.html?"+version
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
          templateUrl: "partials/invitation/content.html?"+version
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
          templateUrl: "partials/loadAvatar/content.html?"+version
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
          templateUrl: "partials/showImage/content.html?"+version
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
          templateUrl: "partials/addVirtualChat/content.html?"+version
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
          templateUrl: "partials/chatInfo/content.html?"+version
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
          templateUrl: "partials/about/content.html?"+version
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
          templateUrl: "partials/virtualChat/content.html?"+version
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
          templateUrl: "partials/updateProfile/content.html?"+version
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
          templateUrl: "partials/vkLogin/content.html?"+version
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
          templateUrl: "partials/preloader/content.html?"+version
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
          templateUrl: "partials/homepage/content.html?"+version
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
          templateUrl: "partials/createFastChat/content.html?"+version
        }
      }
    });
    // .state("updateProfile", {
    //   url: "/updateProfile",
    //   views: {
    //     "title": {
    //       template: "Обновления профиля"
    //     },
    //     "menu": {
    //       templateUrl: "partials/menu.html?"+version
    //     }, 
    //     "content": {
    //       controller: "updateProfileController",
    //       templateUrl: "partials/updateProfile/content.html?"+version
    //     }
    //   }
    // })
}]);

var pushNotification;

var RAN_AS_APP = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

document.addEventListener("deviceready", function() {
    log(">>>>>>>>>>>>>>>>>>>DEVICE READY");
    log("OS version: " + window.device.version);
    
    function successHandler(result) {
        log(result);
        // alert('result = ' + result);
    }

    function errorHandler(error) {
        log(result);
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
          log('body normal height', this.normalHeight);
          $('body').height(this.normalHeight - pixelsToShrink);
          $('#footer').css('position', 'relative');
          log('webview is shrunk on(px)', pixelsToShrink);
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

      function notificationClickHandler(uuid, channelName) {
        location.href = "#/chat?senderId=" + uuid + "&fromState=random&" + 
          "channelName=" + channelName;
      }
      
      window.onNotificationAPN = function(e) {
        log("apn notification", e);
        
        //if coldstart
        if (e.foreground === "0" && !window.isGotUnseenMessage) {
          log(e);
          window.goToLastMessageChat = true;
          return;
        }
        
        //if app was in background
        if (e.foreground === "0") {
          notificationClickHandler(e.uuid, e.channelName);
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
        log(e);
        if (e.event == "registered") {
          window.deviceId = e.regid;
          // registerDeviceToChannel(); 
        }
        else {
          if (e.coldstart) {
            notificationClickHandler(e.payload.uuid, e.payload.channel);
          }
          else if (!e.foreground) {
            notificationClickHandler(e.payload.uuid, e.payload.channel);
          }
        }
      };
    }
});



angular.module("angControllers", []);
var services = angular.module("angServices", []);
var factories = angular.module("angFactories", []);

String.prototype.sanitize = function() {
  return this.replace(/[\\"<>]/gim, function(i) {
    return '&#'+i.charCodeAt(0)+';';
  });
};
String.prototype.escape = function() {
  return this.replace(/[\\\/]/gim, function(i) {
    return '\\'+i;
  });
};
function log() {
  if (localStorage.externalChat === 'true' || App.Settings.debug)
    console.log.apply(console, arguments);
}

window.onload = function onLoad() {
  angular.bootstrap(document, ['angApp']);

  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', App.Settings.gaTrackingCode, 'auto');
  ga('send', 'pageview');
};

$(window).bind('beforeunload', function() {
  ga('send', 'event', 'page', 'close');
});
