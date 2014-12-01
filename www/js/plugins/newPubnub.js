function Pubnub(settings){};



Pubnub.prototype.pubnub = PUBNUB({
    publish_key   : App.Settings.pubnubPublishKey,
    subscribe_key : App.Settings.pubnubSubscribeKey,
    secret_key    : App.Settings.pubnubSecretKey,
    ssl           : App.Settings.pubnubSsl,
    origin        : App.Settings.pubnubOrigin
});



Pubnub.prototype.subscribe = function(channelName) {
  Pubnub.prototype.pubnub.subscribe({
    channel: channelName + App.Settings.pubnubChannelPostfix,
    message: function(message, m_array){

      Pubnub.prototype.processMessage(message, true);
      Pubnub.prototype.saveLastSeenMessageTimestamp(m_array[1]);
    },
    error: function(){
      // alert("Connection Lost");
    }
  });
};

Pubnub.prototype.unsubscribe =  function(channelName){
  Pubnub.prototype.pubnub.unsubscribe({
    channel: channelName + App.Settings.pubnubChannelPostfix
  });
};

Pubnub.prototype.publish = function(receiverName, senderName, messageText){
  Pubnub.prototype.pubnub.publish({
    channel: receiverName + App.Settings.pubnubChannelPostfix,
    message:
      {
        "pn_gcm": {
          "data" : {
              "fffrom": senderName,
              "sentTime": new Date().getTime(),
              "timeToExist": 10000 /*** HARDCODED FOR NOW ***/
            }
        },
        "apns":{
          "alert" : "Пиу от " + senderName + ".",
          "badge": 9,
          "sound": "bingbong.aiff"
        },
      "text": messageText,
      "from": senderName
      }
  });
};

// Pubnub.prototype.subscribeToPushNotifications = function(channelname){
//   window.plugins.PubnubCordova.getRegId(function(data){
//     var url = "http://pubsub.pubnub.com/v1/push/sub-key/" + App.Settings.pubnubSubscribeKey + "/devices/" + data + "?add=" + channelname + "&type=" + App.Settings.pubnubNotificationType;
//     console.log(">>>" + url);
//     $.get(url);
//   });
// };

// Pubnub.prototype.unsubscribeFromPushNotifications = function(channelname){
//   window.plugins.PubnubCordova.getRegId(function(data){
//     var url = "http://pubsub.pubnub.com/v1/push/sub-key/" + App.Settings.pubnubSubscribeKey + "/devices/" + data + "?remove=" + channelname + "&type=" + App.Settings.pubnubNotificationType;
//     $.get(url);
//   });
// };

// Pubnub.prototype.unsubscribeFromAllPushNotificationChannels = function(){
//   window.plugins.PubnubCordova.getRegId(function(data){
//     $.get("http://pubsub.pubnub.com/v1/push/sub-key/" + App.Settings.pubnubSubscribeKey + "/devices/" + data + "/remove?type=" + App.Settings.pubnubNotificationType);
//   });
// };


Pubnub.prototype.getUnseenMessages = function(channelName, timestamp){
  Pubnub.prototype.pubnub.history({
    channel  : channelName + App.Settings.pubnubChannelPostfix,
    reverse: true,
    start: timestamp,
    callback: function(history_a){
      var newMessages = history_a[0];
      var newMessagesLength = newMessages.length;
      if(newMessagesLength)
        for(var i = 0; i < newMessagesLength; i++){
          Pubnub.prototype.processMessage(newMessages[i], false);
        }

      if(history_a[0].length == 100)
        Pubnub.prototype.getUnseenMessages(channelName, history_a[2])

      var newTimestamp = parseInt(history_a[2]) + 2;
      Pubnub.prototype.saveLastSeenMessageTimestamp(newTimestamp);

      /*** PLUGIN EXISTS ONLY FOR ANDROID (FOR NOW AT LEAST) ***/
      // if(device.platform == 'Android')
        window.plugins.DbCordova.removeAllRecentMessages();

    }
  });
};

Pubnub.prototype.saveLastSeenMessageTimestamp = function(timestamp){
  angular.element( $("body") ).scope().saveLastSeenMessageTimestamp(timestamp);
};


Pubnub.prototype.processMessage = function(message, proposeFriendshipPrompt){
  var newFriend = true;
  var friendScope = angular.element( $("#friends") ).scope();
  $.each(friendScope.user.friends, function(i,e){
    if(e.name == message.from) newFriend = false;
  });

  if (proposeFriendshipPrompt && newFriend) {
    navigator.notification.confirm(message.from + " не находится в списке ваших друзей.", function(buttonIndex){
      if(buttonIndex == 1){
        friendScope.addFriend(message.from);
      }
    }, message.from, "Добавить,Не показывать больше,Отменить");  
  }

  var text = message.from + ": " + message.text;
  toastr.centerBlack(text);
};

Pubnub.prototype.getUserId = function(userName) {
  $.post("http://yoo.herokuapp.com/users_search", {
    "search_params": [
      {
        name: userName
      }
    ]
  })
  .success(
    function(res) {
      console.log(res);
    })
  .error(
    function(res) {
      console.log(res);
    }
  )
}