
angular.module("angControllers").controller("friendsCtrl", function($scope, $http){

  $scope.$on("addFriend", function(e,d){
    $scope.addFriend(d);
  });
  $scope.$on("sendNumber", function(e,d){
    $scope.sendNumber(d);
  });
  $scope.$on("findFriendsThroughPhoneBook", function(){
    $scope.findFriendsThroughPhoneBook();
  });


  $(document).on("click", ".friend", function(){
    app.pubnub.publish( $(this).text() , $scope.user.name);
    toastr.centerBlack("Пиу отправлено.");
  });

  $scope.addFriend = function(friend_name){
    $scope.showSpinner();

    $http.post("http://yoo.herokuapp.com/add_friend",
    { user_id: $scope.user.id, friend_name: friend_name })
    .success(function(data){
      if(data.friend_added)
      {
        $scope.user.friends.unshift(data.friend);
      }
      else if(data.user_is_already_your_friend)
      {
        var friendIndex = $scope.getFriendIndex(data.friend_id);
        var friend = $scope.user.friends.splice(friendIndex, 1);
        $scope.user.friends.unshift(friend[0]);
      }

      $scope.hideSpinner();
      window.localStorage.setItem("user", JSON.stringify($scope.user) );
      $('#newFriendName').val("");
      $scope.closeModal("myModal");
      $scope.fillFriendsList();
    })
    .finally(function(){});;
  };

  $scope.sendNumber = function(number){
    alert(number);
    $http.post("http://yoo.herokuapp.com/add_number",
    { user_id: $scope.user.id, phone_number: number })
    .success(function(data){
      if(data.number_added){
        alert(data.phone_number);
        $scope.user.number = data.phone_number;
        window.localStorage.setItem("user", JSON.stringify($scope.user) );
      }
    });
    $scope.closeModal("numberEnteringPrompt");
  };


  $scope.getFriendIndex = function(friendId){
    var friendIndex = null;
    $.each($scope.user.friends , function(i,e){
      if(e.id == friendId) friendIndex = i;
    });
    return friendIndex;
  };


  $scope.getFriend = function(name){
    var friendArray = $scope.user.friends.filter(function(e){
      return e.name === name;
    });
    if(friendArray.length)
      return friendArray[0];
    else
      return null;
  };


  $scope.fillFriendsList = function(){
    var $friendsList = $("#friendsList");
    $friendsList.empty();
    var $ul = $("<ul data-role='listview' data-inset='true' data-filter='true'/>");

    $.each($scope.user.friends, function(i, e){
      $ul.append( $("<li class='button friend'/>").text(e.name) );
    });

    $friendsList.append($ul);
  };

  $scope.findFriendsThroughPhoneBook = function(){
    navigator.contacts.find(["phoneNumbers"], function(contacts){

      var numbers = [];
      $.each(contacts, function(i, e){
        if(e.phoneNumbers)
          $.each(e.phoneNumbers, function(i, e){
            numbers.push( e.value );
          });
      });
      numbers = numbers.join(",").replace(/ |\+|#|\*/gi, '');
      $http.post("http://yoo.herokuapp.com/get_friends_through_numbers",
      { user_id: $scope.user.id, numbers: numbers })
      .success(function(data){
        if(data.friends_are_found){
          $.each(data.friends, function(i,e){
            if(!$scope.getFriend(e.name)){
              $scope.user.friends.push(e);
            }
          });
        }else{
          alert("Ни одного друга из вашей телефонной книги.");
        }
        window.localStorage.setItem("user", JSON.stringify($scope.user) );
        $scope.fillFriendsList();
      });



    },
    function(){ console.log("error") },
    { filter:"", multiple:true });
  };

});