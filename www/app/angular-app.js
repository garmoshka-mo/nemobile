var app = angular.module("angApp");
app.config(['$animateProvider', '$compileProvider', function($animateProvider, $compileProvider) {
  $animateProvider.classNameFilter(/^(?:(?!ng-animate-disabled).)*$/);
  //  Default imgSrcSanitizationWhitelist: /^\s*(https?|ftp|file):|data:image\//
  //  chrome-extension: will be added to the end of the expression
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|content):|data:image\//);
}]);
var version = 'dev';

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
  if (config('debug'))
    console.log.apply(console, arguments);
}

var config;
window.onload = function onLoad() {
  config = new Config(App.Settings);

  angular.bootstrap(document, ['angApp']);

  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', config('gaTrackingCode'), 'auto');
  ga('send', 'pageview');
};

$(window).bind('beforeunload', function() {
  ga('send', 'event', 'page', 'close');
});
