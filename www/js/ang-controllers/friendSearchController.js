angular.module("angControllers").controller("friendSearchController", [
    'user', '$scope', '$http', '$state', 'api', 'friendsList',
    function(user, $scope, $http, $state, api, friendsList){

    // api.getUnseenMessages();
    $scope.showSpinner = false;

    $scope.findUserByName = function() {
        $scope.showSpinner = true;
        api.searchUser($scope.nameToSearch)
        .then(
            function(results) {
                $scope.handleSearchResults(results)
            },
            function() {
                console.error("friend search error")
            }
        )
        .then(
            function() {
                $scope.showSpinner = false;
            },
            function() {
                $scope.showSpinner = false;
            }
        )
    }

    $scope.handleSearchResults = function(res) {
        console.log(res)
        $scope.foundUuid = "";
        var results = res.search_results[0];
        if (results.type) {
            $scope.canBeAdded = false;
            $scope.serverResponse = results.type; 
        }
        else {
            
            if (user.friends[results.uuid]) {
                $scope.canBeAdded = false;
                $scope.serverResponse = "Пользователь уже ваш друг"
                return;                
            }
            
            $scope.canBeAdded = true;
            $scope.nameToAdd = $scope.nameToSearch;
            $scope.foundUuid = results.uuid; 
        }
    }

    $scope.addToFriends = function() {
        if (!user.chats[$scope.foundUuid]) {
            user.addChat($scope.foundUuid);
        }
        user.addFriend($scope.foundUuid, $scope.nameToAdd);
        $scope.canBeAdded = false;
        $scope.serverResponse = "пользователь добавлен";
        console.log(user);
    }


    
}])