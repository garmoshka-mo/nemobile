(function(){
angular.module("angServices")
    .factory('Partner',
    ['userRequest', function(userRequest) {
            
            function Partner(url) {
                this.uuid = url;
            }        

            Partner.prototype = {
                complain: function() {
                    return userRequest.send(
                        'POST',
                        '/users/blacklist',
                        {
                            "user_uuid": uuid
                        }
                    );
                }
            };

        }
    ]);
})();