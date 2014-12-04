angular.module("angControllers").controller("friendSearchController", function($rootScope, $scope, $http, $state, api){

    // api.getUnseenMessages();
    $scope.showSpinner = false;
    var user = $rootScope.user;

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
        .finally(function() {
            $scope.showSpinner = false;
        })
    }

    $scope.handleSearchResults = function(res) {
        console.log(res)
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
            api.addNewChat($scope.foundUuid);
        }
        api.addNewFriend($scope.foundUuid, $scope.nameToAdd);
        $scope.canBeAdded = false;
        $scope.serverResponse = "пользователь добавлен";
        console.log($rootScope.user);
    } 
});