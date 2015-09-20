angular.module("angApp")

.config(['$animateProvider', '$compileProvider', function($animateProvider, $compileProvider) {
    $animateProvider.classNameFilter(/^(?:(?!ng-animate-disabled).)*$/);
    //  Default imgSrcSanitizationWhitelist: /^\s*(https?|ftp|file):|data:image\//
    //  chrome-extension: will be added to the end of the expression
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|content):|data:image\//);
}])

.config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
}]);

window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

var version = 'dev';

var pushNotification;

var RAN_AS_APP = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
var IS_MOBILE = window.mobilecheck();



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


        function keyboardShowHandler(e) {
            window.webViewShrinker.shrink(e.keyboardHeight);
        }

        function keyboardHideHandler() {
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
            // todo: dont use redirection via .href, only router
            // location.href = "#/chat?senderId=" + uuid + "&fromState=random&" +
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
            errorHandler, {
                "senderID": "1176989379",
                "ecb": "onNotificationGCM"
            });

        window.onNotificationGCM = function onNotificationGCM(e) {
            log(e);
            if (e.event == "registered") {
                window.deviceId = e.regid;
                // registerDeviceToChannel(); 
            } else {
                if (e.coldstart) {
                    notificationClickHandler(e.payload.uuid, e.payload.channel);
                } else if (!e.foreground) {
                    notificationClickHandler(e.payload.uuid, e.payload.channel);
                }
            }
        };
    }
});

String.prototype.sanitize = function() {
    return this.replace(/[\\"<>]/gim, function(i) {
        return '&#' + i.charCodeAt(0) + ';';
    });
};
String.prototype.escape = function() {
    return this.replace(/[\\\/]/gim, function(i) {
        return '\\' + i;
    });
};

function log() {
  if (config('debug'))
    console.log.apply(console, arguments);
}

function bootstrapAngularApp() {
    if (RAN_AS_APP) {
        document.addEventListener('deviceready', function() {
            angular.bootstrap(document, ['angApp']);
        });
    } else {
        angular.bootstrap(document, ['angApp']);
    }
}

var config;
window.onload = function onLoad() {
    config = new Config(App.Settings);
    bootstrapAngularApp();
    VK.init({apiId: 5067621, onlyWidgets: true});
};