(function(){
angular.module("angServices")
    .factory('Photo',
    ['apiRequest', function(apiRequest) {
            
            function Photo(url) {
                this.url = url;
            }        

            Photo.prototype = {
                complain: function() {
                    //todo: write request to server

                    // forbidImage: function(imageId) {
                    //     return (apiRequest.send(
                    //         'POST',
                    //         '/image/abuse',
                    //         {
                    //             "image_id": imageId,
                    //         }
                    //     ));
                    // }
                }
            };

        }
    ]);
})();