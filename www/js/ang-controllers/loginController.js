angular.module("angControllers").controller("loginController", ['$rootScope','$scope', '$http', '$state','api', function($rootScope, $scope, $http, $state, api) {
    $scope.signin = function() {
    var friends = {
        "5bc1a59a-7402-11e4-9759-86a7bd11e1af": {name: "david"}
    }

    var chats = {
        "5bc1a59a-7402-11e4-9759-86a7bd11e1af": {
                messages:[],
                senderId: "5bc1a59a-7402-11e4-9759-86a7bd11e1af",   
            getLastMessage: function() {
                if (this.messages.length) {
                    var messagesAmount = this.messages.length;
                    return this.messages[messagesAmount - 1].text;
                }
            },

            getChatTitle: function() {
                if ($rootScope.user.friends[this.senderId]) {
                    return $rootScope.user.friends[this.senderId].name;
                }
                else {
                    return this.senderId;
                }
            }
        }
    }

    console.log("sign in is invoked1");

    api.signin($scope.newUser.name, $scope.newUser.password)
        .then(
            function(res) {
                console.log("signin success");
                $rootScope.user = {
                    accessToken: res.accessToken
                }
                console.log("accessToken assigned");
            },
            function(res) {
                console.log("signin failed");
                $scope.serverResponse = res.errorDescription;
                console.log(JSON.stringify(res));
            }
        )
        .then(function() {
            console.log("before getUserInfo");
            api.getUserInfo($rootScope.user.accessToken).then(
                function(userInfo) {
                    console.log("getUserInfo success");
                    $rootScope.user.name = userInfo.name;
                    $rootScope.user.channel = userInfo.channel_name;
                    $rootScope.user.uuid = userInfo.uuid

                    var userDataInLS = api.getUserFromLS(userInfo.uuid);
                    if (userDataInLS) {
                        $rootScope.user.chats = angular.extend({}, userDataInLS.chats) 
                        $rootScope.user.friends = angular.extend({}, userDataInLS.friends) 
                    }
                    else {
                        $rootScope.user.friends = angular.extend({}, friends),
                        $rootScope.user.chats = angular.extend({}, chats)
                    }

                    console.log("before subscribe");
                    api.subscribe($rootScope.user.channel);
                    console.log($rootScope.user);
                    $state.go('chats');
                },
                function(res) {
                    console.log("fail")
                }
            )

        })
    }
}])
    