(function(){
angular.module("angServices")
    .factory('Photo',
    ['$q', function($q) {
            
            function Photo(url) {
                this.url = url;
            }        

            Photo.prototype = {
                complain: function() {
                    //todo: write request to server

                    // forbidImage: function(imageId) {
                    //     return (userRequest.send(
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