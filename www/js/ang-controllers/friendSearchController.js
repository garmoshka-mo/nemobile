angular.module("angControllers").controller("friendSearchController", [
    'user', '$scope', '$http', '$state', 'api', '$stateParams', 'dictionary',
    function(user, $scope, $http, $state, api, $stateParams, dictionary) {

    $scope.searchBy = "2"; //0 - by name, 1 - by phone number, 2 - newest first
    $scope.showSpinner = false;
    $scope.userToSearch = {};
    var userToSearch = $scope.userToSearch;



    function handleSearchResults(res) {
        // console.log('friendSearch results',res);
        $scope.foundUuid = "";
        var results = res.search_results[0];
        if (results.type) {
            $scope.canBeAdded = false;
            $scope.serverResponse = dictionary.get(results.type); 
        }
        else {
            
            if (user.friendsList.nepotomFriends[results.uuid]) {
                $scope.canBeAdded = false;
                $scope.serverResponse = "Пользователь уже ваш друг";
                $scope.foundUuid = results.uuid;
                return;                
            }
            
            $scope.canBeAdded = true;
            $scope.nameToAdd = $scope.stringToSearch;
            $scope.foundUuid = results.uuid;
            $scope.avatarToAdd = user.parseAvatarDataFromServer(results);
        }
    }

    function isPhoneNumber(string) {
        return string.match(/[a-zA-Zа-яА-Я]/) === null ? true : false; 
    }

    $scope.findUser = function() {
        $scope.showSpinner = true;
        var args = isPhoneNumber($scope.stringToSearch) ? 
            [null, $scope.stringToSearch] :
            [$scope.stringToSearch]; 
        api.searchUser.apply(this, args)
        .then(
            function(results) {
                handleSearchResults(results);
            },
            function() {
                console.error("friend search error");
            }
        )
        .then(
            function() {
                $scope.showSpinner = false;
            },
            function() {
                $scope.showSpinner = false;
            }
        );
    };
    
    $scope.addToFriends = function(goToChat) {
        var friendToAdd = {
            uuid: $scope.foundUuid,
            name: $scope.nameToAdd,
            avatarObj: $scope.avatarToAdd
        };
        user.addFriend(friendToAdd);
        if (!user.chats[$scope.foundUuid]) {
            user.addChat({senderId: $scope.foundUuid});
        }
        if (goToChat) {
            $state.go('chat', {senderId: $scope.foundUuid});
        }
        $scope.canBeAdded = false;
        $scope.serverResponse = "пользователь добавлен";
    };

    $scope.handleEntryClick = function() {
        $scope.addToFriends();
    };

    if ($stateParams.stringToSearch) {
        $scope.stringToSearch = $stateParams.stringToSearch;
        $scope.findUser();
    }

    $('.search-field').eq(0).focus();
}]);