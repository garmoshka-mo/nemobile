(function(){
angular.module("angServices")
    .factory('Partner',
    ['userRequest', function(userRequest) {
            
            function Partner(partnerData) {
                this.idx = partnerData.idx;
                this.avatar = partnerData.avatar;
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

            return Partner;
        }

    ]);
})();