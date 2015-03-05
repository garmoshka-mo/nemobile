angular.module("angControllers").controller("friendsController", 
    ['user','$scope', '$stateParams',
    function(user, $scope, $stateParams) {
    console.log('friends controller is enabled');
    $scope.user = user;
    $scope.isEditMode = false;
    
    var storedLastChosenList = localStorage.lastChosenList;
    if (storedLastChosenList) {
        $scope.showAll = storedLastChosenList;
    }
    else {
        $scope.showAll = "2"; // 0 - nepotom friends, 1 - all friends, 2 - newest friends
    }

    $scope.hideKeyboard = function() {
        console.log("keyboard is hidden");
        if (window.device) {
            cordova.plugins.Keyboard.close();
        }
    };

    $scope.removeFriend = function(event, friend) {
        user.friendsList.removeFriend(friend);
        event.preventDefault();
    };

    $scope.getFriendLink = function(friend) {
        var templateForNepotomUser = "#/chat?senderId=";
        var templateForInvitation = "#/invitation?friendIndex=";

        if (friend.uuid) {
            return templateForNepotomUser + friend.uuid;
        }
        else {
            return templateForInvitation + user.friendsList.friends.indexOf(friend);
        }
    };

    $scope.getFriendImage = function(friend, index) {
        var adorableLink = "http://api.adorable.io/avatars/40/";

        if (friend.photos) {
            return friend.photos[0].value;
        }

        if (friend.uuid) {
            return adorableLink + friend.uuid;
        }

        return adorableLink + index;
    };

    // $scope.generateCards = function() {
    //     function generateCard(friend, index) {
    //         var template = '<div class="card">' +
    //             '<a href="' + $scope.getFriendLink(friend) +'>' +
    //                 '<div class="columns small-3 ava-container">' +
    //                 '    <img src="' + $scope.getFriendImage(friend, index) + '" alt="" class="rounded-ava">' +
    //                ' </div>' +
    //                 '<div class="columns hide-overflow-text h100p title p0 small-9" >' + friend.displayName + '</div>' +
    //             '</a>' +
    //         '</div>';
    //         return template;
    //     }
    //     var generatedCards = '';
    //     user.friendsList.friends.forEach(function(friend, index){
    //         generatedCards += generateCard(friend, index);
    //     })
    //     $('.allFriends').html(generatedCards);
    // }

    $scope.$watch('showAll', function() {
        localStorage.lastChosenList = $scope.showAll;
    });

    if (!user.isParsingFromStorageNow) {
        user.friendsList.getUserContacts();
        $scope.generateCards()
    }
}]);