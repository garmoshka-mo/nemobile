angular.module("angServices").service('pushNotification',
        ['deviceInfo', 'userRequest',
function (deviceInfo, userRequest) {
    if (IS_APP) {
        var push = PushNotification.init({ "android": {"senderID": "1176989379"},
         "ios": {"alert": "true", "badge": "true", "sound": "true"}, "windows": {} } );
        
        push.on('registration', function(data) {
            var requestData = {};
        
            requestData.key = data.registrationId;
        
            if (deviceInfo.isAndroid) {
                requestData.kind = 'gcm';
            }

            if (deviceInfo.isIos) {
                requestData.kind = 'apn';
            }

            userRequest.send('POST', '/device', requestData)
            .then(
                function(res) {
                    console.log(res);
                },
                function(res) {
                    console.log(res);
                }
            );
            console.log(data);
        });

        push.on('notification', function(data) {
            console.log(data);
            // data.message, 
            // data.title, 
            // data.count, 
            // data.sound, 
            // data.image, 
            // data.additionalData 
        });
    }
    
}]);
