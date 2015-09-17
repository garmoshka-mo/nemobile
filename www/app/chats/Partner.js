(function(){
services
    .factory('Partner',
    ['apiRequest', function(apiRequest) {
            
            function Partner(url) {
                this.uuid = url;
            }        

            Partner.prototype = {
                complain: function() {
                    return apiRequest.send(
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