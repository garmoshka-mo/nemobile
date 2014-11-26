angular.module("angControllers").controller("loginRegistrationCtrl", function($scope, $http){

  $scope.loginOrRegiser = function(type, isValid){
    if($scope.disableLogin) return;
    if(!isValid) return alert("Wrong login or password!");
    $scope.beforeRequestCallback();

    if(type == "login")
      var url = "http://yoo.herokuapp.com/login";
    else
      var url = "http://yoo.herokuapp.com/register";

    $http.post(url,
    { name: $scope.newUser.name, password: $scope.newUser.password })
    .success(function(data){
      $scope.afterRequestCallback();
      if(data.logged || data.registered)
        $scope.successfulCallback(data);
      else
        alert(data.message);
    })
    .error(function(data){
      $scope.afterRequestCallback();
      alert("A server error occured!");
    });
  };



  $scope.beforeRequestCallback = function(){
    $scope.showSpinner();
    $scope.$parent.disableLogin = true;
    $(".loginRegisterButton").toggleClass("hidden");
  };

  $scope.afterRequestCallback = function(){
    $(".loginRegisterButton").toggleClass("hidden");
    $scope.hideSpinner();
    $scope.$parent.disableLogin = false;
  };

  $scope.successfulCallback = function(data){
    $scope.$parent.user = data.user.user;
    $scope.$parent.user.friends = data.user.friends;
    angular.element( $("#friends") ).scope().fillFriendsList();
    window.localStorage.setItem("user", JSON.stringify($scope.user) );
    app.pubnub.subscribe($scope.user.name); 
    app.pubnub.subscribeToPushNotifications($scope.user.name + App.Settings.pubnubChannelPostfix);
    $scope.$emit("getUnseenMessages", {channel: $scope.user.name, timestamp: $scope.user.timestamp});
    $scope.newUser = {};
    $scope.$parent.registrationDialogVisible = false;
    $scope.$parent.loginDialogVisible = false;
    console.log(data);
    console.log($scope.$parent.user);
  };



});