angular.module("angControllers")
    .controller("publishPreviewController", [
        '$scope', 'posts', 'routing',
        function($scope, posts, routing) {

            //Mock
            $scope.chat = {
                chat_uuid: 'Njk3NzUwMzI=',
                title: 'Once upn a time chat',
                chat: {
                    duration_s: 500,
                    messages: [{"text":"Прив, как дел?","isOwn":true},{"text":"Норм чо","isOwn":false},{"text":"а у тя?","isOwn":false},{"text":"тож ничё","isOwn":true}]
                }
            };

            $scope.reset = function() {
                //TODO:
            };

            $scope.publishPost = function() {
                posts.publishPost($scope.chat).then(function(data){
                    routing.goto('publishSuccess');
                });
            };

            var post = posts.getLastPublishedPost();
            if(post){
                $scope.postUrl = 'http://dub.ink/pub/' + post.safe_id;
            }
        }
    ]);
