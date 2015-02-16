angular.module("angControllers").controller("friendSearchController", [
    'user', '$scope', '$http', '$state', 'api',
    function(user, $scope, $http, $state, api){

    $scope.searchBy = "0"; //0 - by name, 1 - by phone number
    $scope.showSpinner = false;

    $scope.findUser = function() {
        $scope.showSpinner = true;
        var args = $scope.searchBy === "0" ? 
            [$scope.nameToSearch] :
            [null, $scope.phoneToSearch]; 
        api.searchUser.apply(this, args)
        .then(
            function(results) {
                $scope.handleSearchResults(results);
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

    $scope.handleSearchResults = function(res) {
        console.log(res);
        $scope.foundUuid = "";
        var results = res.search_results[0];
        if (results.type) {
            $scope.canBeAdded = false;
            $scope.serverResponse = results.type; 
        }
        else {
            
            if (user.friendsList.nepotomFriends[results.uuid]) {
                $scope.canBeAdded = false;
                $scope.serverResponse = "Пользователь уже ваш друг";
                return;                
            }
            
            $scope.canBeAdded = true;
            $scope.nameToAdd = $scope.searchBy === '0' ? $scope.nameToSearch : $scope.phoneToSearch;
            $scope.foundUuid = results.uuid; 
        }
    };

    $scope.addToFriends = function() {
        $scope.canBeAdded = false;
        user.addFriend($scope.foundUuid, $scope.nameToAdd);
        if (!user.chats[$scope.foundUuid]) {
            user.addChat($scope.foundUuid);
        }
        $scope.serverResponse = "пользователь добавлен";
        console.log(user);
    };


    
}]);