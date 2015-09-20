angular.module("angControllers")
    .controller("publishPreviewController", [
        '$scope', 'posts', 'router', '$stateParams', 'chats',
        function($scope, posts, router, $stateParams, chats) {

            var chat;
            $scope.session = {};
            if ($stateParams.channelName) {
                chat = chats.getChat($stateParams.channelName);
                chat.getLastUnexpiredChatSession()
                .then(
                    function(chatSession) {
                        //angular.copy is necessary in order not to change 
                        //messages in chat session
                        angular.copy(chatSession, $scope.session);
                        log($scope.session === chatSession);
                    }
                );
            }   
            else {
                console.warn('channel name is required');
            }

            //Mock
            // $scope.chat = {
            //     chat_uuid: 'Njk3NzUwMzI=',
            //     title: 'Once upn a time chat',
            //     chat: {
            //         duration_s: 500,
            //         messages: [{"text":"Прив, как дел?","isOwn":true},{"text":"Норм чо","isOwn":false},{"text":"а у тя?","isOwn":false},{"text":"тож ничё","isOwn":true}]
            //     }
            // };

            $scope.reset = function() {
                //TODO:
            };

            $scope.publishPost = function() {
                posts.publishPost($scope.chat).then(function(data){
                    router.goto('publishSuccess');
                });
            };

            var post = posts.getLastPublishedPost();
            if(post){
                $scope.postUrl = 'http://dub.ink/pub/' + post.safe_id;
            }
        }
    ]);
