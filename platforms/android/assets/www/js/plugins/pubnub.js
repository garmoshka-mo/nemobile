
Plugins = ( typeof Plugins == 'undefined' ? {} : Plugins );


Plugins.Pubnub = {
  publishKey: 'demo-36',

  pubnub: (PUBNUB({
    publish_key   : 'demo-36',
    subscribe_key : 'demo-36',
    secret_key: "demo-36",
    ssl           : false,
    origin        : 'pubsub.pubnub.com'
  })),

  subscribe: function(name){
    Plugins.Pubnub.pubnub.subscribe({
      channel  : (name + "qwer_4321_qwer"),
      message : function(message, m_array){
        angular.element( $("body") ).scope().saveLastSeenMessageTimestamp(m_array[1]);
        Plugins.Pubnub.processMessage(message.message, true);
      },
      error : function() {
        alert("Connection Lost");
      }
    });
  },

  getPushNotificationChannels: function(func){
    window.plugins.PubnubCordova.getRegId(function(data){
      $.get("http://pubsub.pubnub.com/v1/push/sub-key/demo-36/devices/" + data + "?type=gcm", function(response){
        return JSON.parse(response);
      });
    });
  }

  subscribeToPushNotifications: function(channename){
    window.plugins.PubnubCordova.getRegId(function(data){
      $.get("http://pubsub.pubnub.com/v1/push/sub-key/demo-36/devices/" + data + "?add=" + channelname + "&type=gcm");
      $.get("http://pubsub.pubnub.com/v1/push/sub-key/demo-36/devices/" + data + "?add=" + channelname + "&type=apns");
    });
  },

  unsubscribeFromPushNotifications: function(channename){
    window.plugins.PubnubCordova.getRegId(function(data){
      $.get("http://pubsub.pubnub.com/v1/push/sub-key/demo-36/devices/" + data + "?remove=" + channelname + "&type=gcm");
      $.get("http://pubsub.pubnub.com/v1/push/sub-key/demo-36/devices/" + data + "?remove=" + channelname + "&type=apns");
    });
  },

  unsubscribeFromAllPushNotificationChannels: function(obj){
    window.plugins.PubnubCordova.getRegId(function(data){
      $.get("http://pubsub.pubnub.com/v1/push/sub-key/demo-36/devices/" + data + "?type=" + obj.type, function(response){
        $.each( JSON.parse(response) , function(i,e){
          Plugins.Pubnub.unsubscribeFromPushNotifications(e);
        });
      });
    });
  }

  getUnseenMessages: function(name, timestamp){
    Plugins.Pubnub.pubnub.history({
        channel  : (name + "qwer_4321_qwer"),
        reverse: true,
        start: timestamp,
        callback: function(h){
          var newMessages = h[0];
          if(newMessages.length)
            for(var i = 0; i < newMessages.length; i++)
            {
              //Plugins.Pubnub.processMessage(newMessages[i].message, false);
              //console.log(">>>MESSAGE" + JSON.stringify(newMessages[i]) );
            }
            console.log(">>>>" + new Date( Math.round( h[2] / 10000 ) ));

          Plugins.Pubnub.saveLastSeenMessageTimestamp(h[2]);
          if(h[0].length == 100) Plugins.Pubnub.getUnseenMessages(name, h[2]);
        }
      });
  },

  unsubscribe: function(name){
    Plugins.Pubnub.pubnub.unsubscribe({
      channel: (name + "qwer_4321_qwer")
    });
  },

  publish: function(receiverName, senderName){
    Plugins.Pubnub.pubnub.publish({
      channel: (receiverName + "qwer_4321_qwer"),
      message:
        {
          "pn_gcm": {
            "data" : {
                "fffrom": senderName,
              }
          },
          "apns":{
            "alert" : "Пиу от " + senderName + ".",
             "badge": 9,
        "sound": "bingbong.aiff"
          },
        "from": senderName
        }
    });
  },

  processMessage: function(message, proposeFriendshipPrompt){
    console.log( JSON.stringify(message) );
    var newFriend = true;

    var friendScope = angular.element( $("#friends") ).scope();
    $.each(friendScope.user.friends, function(i,e){
      if(e.name == message.from){
        e.piu_counter++
        window.localStorage.setItem("user", JSON.stringify(friendScope.user) );
        newFriend = false;
      }

    });

        if(proposeFriendshipPrompt && newFriend){
          navigator.notification.confirm(message.from + " не находится в списке ваших друзей.", function(buttonIndex){
            if(buttonIndex == 1){
              friendScope.addFriend(message.from);
            }
          }, message.from, "Добавить,Не показывать больше,Отменить");  
        }


    var text = "Пиу от " + message.from + "!";
    toastr.centerBlack(text);
  },

  saveLastSeenMessageTimestamp: function(timestamp){
    angular.element( $("body") ).scope().saveLastSeenMessageTimestamp(timestamp);
  }

};