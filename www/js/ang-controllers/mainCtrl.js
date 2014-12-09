angular.module("angControllers").controller("mainCtrl", function($rootScope, $scope, $http, $location, $state, notification){
  
  $rootScope.isAppInBackground = false;

  document.addEventListener("pause", function() {
     $rootScope.isAppInBackground = true;
  });
  document.addEventListener("resume", function() {
     $rootScope.isAppInBackground = false;
  });

  $scope.$on("getUnseenMessages", function(e,d){
    $scope.getUnseenMessages(d.channel, d.timestamp);
  });
  $scope.newUser = {};

  $scope.registrationDialogVisible = false;
  $scope.loginDialogVisible = false;
  $scope.spinner = new Spinner(opts);
  // app.pubnub.getUserId($scope.user.name);

  $scope.$on("$stateChangeStart", function() {
    notification.clear();
  })

  $scope.goToSignIn = function() {
      $state.go('signin');
  }
  $scope.goToSignUp = function() {
      $state.go('signup');
  }
  $scope.isUserLogged = function(){
    return !!($scope.user.name);
  };

  $scope.getUnseenMessages = function(name, timestamp){
    app.pubnub.getUnseenMessages(name, timestamp);
  };

  $scope.isNumberSubmitted = function(){
    return !!($scope.user.number)
  };

  $scope.logout = function(){
    window.localStorage.removeItem("user");
    app.pubnub.unsubscribe($scope.user.name);
    app.pubnub.unsubscribeFromPushNotifications($scope.user.name + App.Settings.pubnubChannelPostfix);
    $scope.user = { name: "", number: "", friends: [] };
  };

  $scope.saveLastSeenMessageTimestamp = function(timestamp){
    $scope.user.lastSeenMessageTimestamp = timestamp;
    window.localStorage.setItem("user", JSON.stringify($scope.user) );
    $http.post("http://yoo.herokuapp.com/save_timestamp",
      { user_id: $scope.user.id, timestamp: timestamp });
  }


  $scope.showRegistrationDialog = function(){
    $scope.formAction = 'register'
    $scope.registrationDialogVisible = true;
    $scope.loginDialogVisible = false;
  };
  $scope.showLoginDialog = function(){
    $scope.formAction = "login";
    $scope.registrationDialogVisible = false;
    $scope.loginDialogVisible = true;
  };

  $scope.showSpinner = function(){
    $scope.spinner.spin();
    $("body").append($scope.spinner.el);
  };
  $scope.hideSpinner = function(){
    $scope.spinner.stop();
  };

  $scope.closeModal = function(modalId){
    $("#" + modalId).foundation('reveal', 'close');
  };

  $scope.openModal = function(modalId){
    $("#" + modalId).foundation('reveal', 'open');
  };

  $scope.addFriend = function(){
    var name = $('#newFriendName').val();
    if(name.length)
      $scope.$broadcast("addFriend", name);
    else
      alert("Поле имени пустое!");
  };

  $scope.foundationEvaluate = function(elementId){
    $("#" + elementId).foundation();
  };

  $scope.sendNumber = function(){
    var number = $('#usersPhoneNumber').val();
    if(number.replace(/ |\+|\(|\)|\-/gi, '').match(/^[0-9]+$/))
      $scope.$broadcast("sendNumber", number);
    else
      alert("Поле номера пустое или содержит запрещённые символы!");
  };

  $scope.findFriendsThroughPhoneBook = function(){
    $scope.$broadcast("findFriendsThroughPhoneBook", null);
  };



});