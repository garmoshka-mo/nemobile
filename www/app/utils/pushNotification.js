angular.module("angServices").service('pushNotification',
        [
function () {
    if (IS_APP) {
        var push = PushNotification.init({ "android": {"senderID": "12345679"},
         "ios": {"alert": "true", "badge": "true", "sound": "true"}, "windows": {} } );
        
        push.on('registration', function(data) {
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
