angular.module("angControllers").controller("friendsController", 
    ['user','$scope', '$stateParams', '$timeout', '$state', '$http', 'router',
    function(user, $scope, $stateParams, $timeout, $state, $http, router) {
    log('friends controller is enabled');
    $scope.user = user;
    $scope.isEditMode = false;
    $scope.limitTo = 20;
    $scope.showSpinner = false;

    var storedLastChosenList = localStorage.lastChosenList;
    if (storedLastChosenList) {
        $scope.listToShow = storedLastChosenList;
    }
    else {
        $scope.listToShow = "новые"; 
    }

    $scope.shownList = $scope.listToShow;

    $scope.hideKeyboard = function() {
        log("keyboard is hidden");
        if (RAN_AS_APP) {
            cordova.plugins.Keyboard.close();
        }
    };

    $scope.removeFriend = function(event, friend) {
        user.friendsList.removeFriend(friend);
        event.preventDefault();
    };

    $scope.getFriendLink = function(friend) {
        var templateForNepotomUser = "#/chat?senderId=";
        var templateForVirtualChat = "#/addVirtualChat?friendIndex=";

        if (friend.uuid) {
            return templateForNepotomUser + friend.uuid;
        }
        else {
            return templateForVirtualChat + user.friendsList.friends.indexOf(friend);
        }
    };

    $scope.handleFriendClick = function(friend) {

        if (friend.uuid) {
            router.goto('chat', {senderId: friend.uuid});
        }
        else {
            router.goto('addVirtualChat', {friendIndex: user.friendsList.friends.indexOf(friend)});
        }
    };



    $scope.getNextLimit = function() {
        $scope.limitTo = $scope.limitTo + 20; 
    };

    $scope.getFriendImage = function(friend, index) {
        var adorableLink = "http://api.adorable.io/avatars/40/";

        if (friend.photos) {
            return friend.photos[0].valueMini ? 
                friend.photos[0].valueMini : friend.photos[0].value;
        }

        if (friend.uuid) {
            return adorableLink + friend.uuid;
        }

        return adorableLink + index;
    };

    $scope.showSpinner = false;
    $scope.$watch('listToShow', function(newValue, oldValue) {
        // $scope.showSpinner = true;
        if (newValue == "+") {
            $state.go('friendSearch');
        }
        else {
            $timeout(function() {
                $scope.shownList = newValue;
                // $scope.showSpinner = false;
                localStorage.lastChosenList = newValue;
            }, 0);
        }
    });

    // todo: rely on friendsList promise, not on user's
    //user.ensureLoadFromStorage().then(function() {
    //    if (!user.friendsList.gotUserContacts) {
    //        user.friendsList.getUserContacts();
    //    }
    //});


    //for debbuging 
    $scope.debug = function(contact) {
        var clicked = localStorage.clicked === "true" ? true : false;
        if (clicked) {
            localStorage.clicked = false;
            var cache = [];
            
            var b = JSON.stringify(contact, function(key, value) {
                if (typeof value === 'object' && value !== null) {
                    if (cache.indexOf(value) !== -1) {
                        // Circular reference found, discard key
                        return;
                    }
                    // Store value in our collection
                    cache.push(value);
                }
                return value;
            });
            $http.post('http://localhost:5000/', {msg: b});
        }
        else {
            cache = [];
            b = JSON.stringify(contact, function(key, value) {
                if (typeof value === 'object' && value !== null) {
                    if (cache.indexOf(value) !== -1) {
                        // Circular reference found, discard key
                        return;
                    }
                    // Store value in our collection
                    cache.push(value);
                }
                return value;
            });
            $http.post('http://localhost:5000/', {msg: b});
            localStorage.clicked = true;        
        }

    };
}]);