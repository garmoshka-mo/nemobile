angular.module("angControllers").controller("mainController", [
    '$rootScope', '$scope', '$http', 'notification', 'api', 'storage', 'user', 'ChatSession','$timeout', 'routing','deviceInfo', '$state',
    function($rootScope, $scope, $http, notification, api, storage, user, ChatSession, $timeout, routing, deviceInfo, $state) {

    $scope.user = user;

    console.log('main controller is invoked');

    $rootScope.isAppInBackground = false;
    $scope.RAN_AS_APP = RAN_AS_APP;
    $scope.isOnline = deviceInfo.isOnline; 
    $scope.isUserScoresShown = true;

    var statesWhereShowBackArrow = [
        'chat',
        'showImage',
        'chatInfo'
    ];
    var forbidToGoBackStates = [
        'addVirtualChat'
    ];

    var statesAllowedForVirtualUser = [
        'updateProfile',
        'chat'
    ];

    var statesNotShowScores = [
        'chat',
        'chatInfo',
        'showImage'
    ];

    if (navigator.device) {
        $scope.isWeb = false;
    }
    else {
        $scope.isWeb = true;
    }

    document.addEventListener("pause", function() {
        $rootScope.isAppInBackground = true;
        user.saveChats();
    });

    document.addEventListener("resume", function() {
        $rootScope.isAppInBackground = false;
    });

    document.addEventListener("deviceready", function() {
        if (device.platform === "iOS") {
          $(".iphone-hack").show();
        }
    });

    $scope.toggleMenu = function() {
        //async call is necessary for correct work on android 4.1.1
        $timeout(function() {
            var state = snapper.state().state;
            console.log(state);
            if (state === 'right') {
                console.log('openning menu!');
                if (RAN_AS_APP) {
                    if (window.device.platform === "iOS") {
                        cordova.plugins.Keyboard.close();
                    }
                }
                console.log("device's OS is not iOS");
                
                snapper.open('left');
            }
            else {
                snapper.close('left');
            }
        }, 0);
    };

    $scope.showBackArrow = function() {
        $scope.isBackArrownShown = true;
    };

    $scope.hideBackArrow = function () {
        $scope.isBackArrownShown = false;
    };

    $scope.backArrowHandler = function() {
        window.history.back();
    };

    $scope.$on('$stateChangeStart',
        function(evt, toState, toParams, fromState, fromParams) {
            // console.log("state is changed!");
            notification.clear();

            if (RAN_AS_APP) {
                routing.is_preload = true;
            }   
             
            if (_.includes(statesNotShowScores, toState.name)) {
                $scope.isUserScoresShown = false;
            }
            else {
                $scope.isUserScoresShown = true;
            }
            
            if (user.isVirtual) {
                if (!_.includes(statesAllowedForVirtualUser, toState.name)) {
                    evt.preventDefault();
                }
                return;
            }

            if (_.includes(statesWhereShowBackArrow, toState.name) && 
                !_.includes(forbidToGoBackStates, fromState.name)) {
                $scope.showBackArrow();
            }
            else {
                $scope.hideBackArrow();
            }
        }
    );

    $scope.routing = routing;
    $scope.goto = routing.goto;

}]);